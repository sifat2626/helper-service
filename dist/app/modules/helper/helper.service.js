"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelperServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const uploadToDigitalOcean_1 = require("../../utils/uploadToDigitalOcean");
const checkReference_1 = require("../../utils/checkReference");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const client_1 = require("@prisma/client");
const sendEmail_1 = require("../../utils/sendEmail");
const removeFileFromSpaces_1 = require("../../utils/removeFileFromSpaces");
const createHelper = (helperData, photo, biodata) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Step 1: Handle photo and biodata uploads
    const photoUrl = photo ? yield (0, uploadToDigitalOcean_1.uploadFileToDigitalOcean)(photo, 'maids/photos') : '';
    const biodataUrl = biodata ? yield (0, uploadToDigitalOcean_1.uploadFileToDigitalOcean)(biodata, 'maids/biodatas') : '';
    // Step 2: Create the maid in a transaction
    const maid = yield prisma_1.default.maid.create({
        data: {
            name: helperData.name,
            age: helperData.age,
            workHistory: helperData.workHistory,
            nationality: helperData.nationality,
            experience: helperData.experience,
            photo: photoUrl,
            biodataUrl,
            availability: helperData.availability,
        },
    });
    const serviceNames = (_a = helperData === null || helperData === void 0 ? void 0 : helperData.serviceNames) === null || _a === void 0 ? void 0 : _a.split(',');
    // Step 3: Handle multiple services outside the transaction
    if (helperData.serviceNames && helperData.serviceNames.length > 0) {
        for (const serviceName of serviceNames) {
            console.log('serviceName', serviceName);
            // Find or create the service
            const service = yield prisma_1.default.service.upsert({
                where: { name: serviceName },
                update: {}, // No updates for existing service
                create: { name: serviceName },
            });
            // Create the relation in `maidService`
            yield prisma_1.default.maidService.create({
                data: {
                    maidId: maid.id,
                    serviceId: service.id,
                },
            });
        }
    }
    return maid;
});
const bulkCreateHelpers = (helpers) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = [];
    let successCount = 0;
    for (const helper of helpers) {
        console.log(helper);
        try {
            // Split the `serviceNames` string into an array using ';' as a delimiter
            const serviceNames = [];
            helper.serviceNames.map((serviceName) => {
                // Trim whitespace and sanitize the string
                const sanitizedServiceName = serviceName.trim();
                // Validate serviceName to ensure no invalid characters
                if (sanitizedServiceName && /^[a-zA-Z0-9_ ]*$/.test(sanitizedServiceName)) {
                    serviceNames.push(sanitizedServiceName);
                }
                else {
                    throw new Error(`Invalid service name: ${serviceName}`);
                }
            });
            const maid = yield prisma_1.default.maid.upsert({
                where: { id: helper.id },
                update: {
                    name: helper.name,
                    age: Number(helper.age),
                    workHistory: helper.workHistory,
                    nationality: helper.nationality,
                    experience: Number(helper.experience),
                    availability: helper.availability.toString().toLowerCase() === 'true',
                    photo: helper.photo || '',
                    biodataUrl: helper.biodataUrl || '',
                },
                create: {
                    name: helper.name,
                    age: Number(helper.age),
                    nationality: helper.nationality,
                    workHistory: helper.workHistory,
                    experience: Number(helper.experience),
                    availability: helper.availability.toString().toLowerCase() === 'true',
                    photo: helper.photo || '',
                    biodataUrl: helper.biodataUrl || '',
                },
            });
            // Iterate over the service names and associate them with the maid
            for (const serviceName of serviceNames) {
                let service = yield prisma_1.default.service.findUnique({
                    where: { name: serviceName.trim() },
                });
                if (!service) {
                    service = yield prisma_1.default.service.create({
                        data: { name: serviceName.trim() },
                    });
                }
                yield prisma_1.default.maidService.upsert({
                    where: {
                        maidId_serviceId: {
                            maidId: maid.id,
                            serviceId: service.id,
                        },
                    },
                    update: {},
                    create: {
                        maidId: maid.id,
                        serviceId: service.id,
                    },
                });
            }
            successCount++;
        }
        catch (error) {
            errors.push(`Failed to process helper with email ${helper.email}: ${error.message}`);
        }
    }
    return { successCount, errors };
});
const getAllHelpers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = 10, page = 1, minAge, maxAge, nationality, minExp, maxExp, serviceNames = [], // Array of service names to filter
    availability, name, id, email, } = query;
    const filters = {};
    if (name) {
        filters.name = {
            contains: name,
            mode: 'insensitive',
        };
    }
    if (id) {
        filters.id = id;
    }
    if (email) {
        filters.email = {
            contains: email,
            mode: 'insensitive',
        };
    }
    if (minAge && maxAge) {
        filters.age = {
            gte: Number(minAge),
            lte: Number(maxAge),
        };
    }
    else if (minAge) {
        filters.age = { gte: Number(minAge) };
    }
    else if (maxAge) {
        filters.age = { lte: Number(maxAge) };
    }
    if (minExp && maxExp) {
        filters.experience = {
            gte: Number(minExp),
            lte: Number(maxExp),
        };
    }
    else if (minExp && !maxExp) {
        filters.experience = { gte: Number(minExp) };
    }
    else if (maxExp && !minExp) {
        filters.experience = { lte: Number(maxExp) };
    }
    if (nationality) {
        filters.nationality = {
            contains: nationality,
            mode: 'insensitive',
        };
    }
    //
    // if (experience) {
    //   filters.experience = { gte: Number(experience) };
    // }
    if (availability !== undefined) {
        filters.availability = availability.toString() === 'true';
    }
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;
    // Ensure serviceNames is an array
    const parsedServiceNames = Array.isArray(serviceNames)
        ? serviceNames
        : typeof serviceNames === 'string'
            ? JSON.parse(serviceNames) // Parse JSON string to array if passed as such
            : [];
    // If serviceNames is provided, filter to ensure the maid has all the specified services
    const serviceFilter = parsedServiceNames.length > 0
        ? {
            AND: parsedServiceNames.map((serviceName) => ({
                MaidServices: {
                    some: {
                        Service: {
                            name: {
                                equals: serviceName,
                            },
                        },
                    },
                },
            })),
        }
        : {};
    // Merge service filter with other filters
    const finalFilters = Object.assign(Object.assign({}, filters), serviceFilter);
    const totalHelpers = yield prisma_1.default.maid.count({
        where: finalFilters,
    });
    const helpers = yield prisma_1.default.maid.findMany({
        where: finalFilters,
        skip,
        take,
        include: {
            MaidServices: {
                include: {
                    Service: true,
                },
            },
        },
    });
    return {
        meta: {
            total: totalHelpers,
            limit: take,
            page: Number(page),
            totalPages: Math.ceil(totalHelpers / take),
        },
        data: helpers,
    };
});
const updateHelper = (id, helperData, photo, biodata) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the helper exists
    const existingHelper = yield prisma_1.default.maid.findUnique({
        where: { id },
        include: {
            MaidServices: true, // Include existing services for the helper
        },
    });
    if (!existingHelper) {
        throw new AppError_1.default(404, 'Helper not found.');
    }
    const photoUrl = photo
        ? yield (0, uploadToDigitalOcean_1.uploadFileToDigitalOcean)(photo, 'maids/photos')
        : existingHelper.photo; // Retain the existing photo URL if no new file
    const biodataUrl = biodata
        ? yield (0, uploadToDigitalOcean_1.uploadFileToDigitalOcean)(biodata, 'maids/biodatas')
        : existingHelper.biodataUrl; // Retain the existing biodata URL if no new file
    // Update basic fields
    const updatedHelperData = {};
    if (helperData.name)
        updatedHelperData.name = helperData.name;
    if (helperData.email)
        updatedHelperData.email = helperData.email;
    if (helperData.age)
        updatedHelperData.age = Number(helperData.age);
    if (helperData.experience)
        updatedHelperData.age = Number(helperData.experience);
    if (helperData.workHistory)
        updatedHelperData.workHistory = helperData.workHistory;
    if (helperData.nationality)
        updatedHelperData.nationality = helperData.nationality;
    if (photoUrl)
        updatedHelperData.photo = photoUrl;
    if (biodataUrl)
        updatedHelperData.biodataUrl = biodataUrl;
    if (helperData.availability !== undefined) {
        updatedHelperData.availability = helperData.availability;
    }
    // Update the helper record
    const updatedHelper = yield prisma_1.default.maid.update({
        where: { id },
        data: updatedHelperData,
    });
    // Handle service updates
    if (helperData.serviceNames && helperData.serviceNames.length > 0) {
        // Clear existing services
        yield prisma_1.default.maidService.deleteMany({
            where: { maidId: id },
        });
        const serviceNames = helperData.serviceNames.split(',');
        // Process and associate new services
        for (const serviceName of serviceNames) {
            let service = yield prisma_1.default.service.findUnique({
                where: { name: serviceName.trim() },
            });
            if (!service) {
                // Create the service if it doesn't exist
                service = yield prisma_1.default.service.create({
                    data: { name: serviceName.trim() },
                });
            }
            // Link the maid with the service
            yield prisma_1.default.maidService.create({
                data: {
                    maidId: id,
                    serviceId: service.id,
                },
            });
        }
    }
    return updatedHelper;
});
const deleteHelper = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the maid exists
    const maid = yield prisma_1.default.maid.findUnique({
        where: { id },
    });
    if (!maid) {
        throw new AppError_1.default(404, "Helper (Maid) not found.");
    }
    // Ensure the maid is not referenced in other tables before deletion
    const referencingModels = [
        { model: "booking", field: "maidId" },
        { model: "favorite", field: "maidId" },
    ];
    const isReferenced = yield (0, checkReference_1.isDataReferenced)("maid", "id", id, referencingModels);
    if (isReferenced) {
        throw new AppError_1.default(400, "This maid cannot be deleted because it is referenced in other records.");
    }
    // Delete photo & biodata from DigitalOcean Spaces if they exist
    if (maid.photo) {
        yield (0, removeFileFromSpaces_1.removeFileFromSpaces)(maid.photo);
    }
    if (maid.biodataUrl) {
        yield (0, removeFileFromSpaces_1.removeFileFromSpaces)(maid.biodataUrl);
    }
    // Delete the helper (maid) record from the database
    yield prisma_1.default.maid.delete({
        where: { id },
    });
    return { message: "Helper (Maid) deleted successfully" };
});
const addHelperToFavorites = (userId, maidId) => __awaiter(void 0, void 0, void 0, function* () {
    const maid = yield prisma_1.default.maid.findUnique({
        where: {
            id: maidId,
        },
    });
    if (!maid) {
        throw new AppError_1.default(400, 'Sorry! Maid not found');
    }
    const existingFavorite = yield prisma_1.default.favorite.findFirst({
        where: {
            userId: userId,
            maidId: maidId,
        },
    });
    if (existingFavorite) {
        throw new AppError_1.default(400, 'This maid is already in your favorites.');
    }
    const result = yield prisma_1.default.favorite.create({
        data: {
            maid: {
                connect: {
                    id: maidId,
                },
            },
            user: {
                connect: {
                    id: userId,
                },
            },
        },
    });
});
const removeHelperFromFavorites = (userId, maidId) => __awaiter(void 0, void 0, void 0, function* () {
    const maid = yield prisma_1.default.maid.findUnique({
        where: {
            id: maidId,
        },
    });
    if (!maid) {
        throw new AppError_1.default(400, 'Sorry! Maid not found');
    }
    const existingFavorite = yield prisma_1.default.favorite.findFirst({
        where: {
            userId: userId,
            maidId: maidId,
        },
    });
    if (!existingFavorite) {
        throw new AppError_1.default(400, 'This maid is not in your favorites.');
    }
    const result = yield prisma_1.default.favorite.delete({
        where: {
            id: existingFavorite.id
        }
    });
    return result;
});
const bookHelper = (userId, maidId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if maid exists and is available
        const maid = yield prisma.maid.findFirst({
            where: {
                id: maidId,
                availability: true,
            },
        });
        if (!maid) {
            throw new AppError_1.default(400, 'Sorry! Maid is either not found or unavailable.');
        }
        // Create the booking
        const result = yield prisma.booking.create({
            data: {
                maid: {
                    connect: {
                        id: maidId,
                    },
                },
                user: {
                    connect: {
                        id: userId,
                    },
                },
                date: new Date(),
            },
            // include:{
            //   maid:true,
            //   user:true
            // }
        });
        // Set maid's availability to false
        // await prisma.maid.update({
        //   where: { id: maidId },
        //   data: { availability: false },
        // });
        // Notify all admins via email
        const admins = yield prisma.user.findMany({
            where: {
                OR: [{ role: client_1.UserRoleEnum.ADMIN }, { role: client_1.UserRoleEnum.SUPERADMIN }],
            },
        });
        if (admins.length === 0) {
            console.warn('No admins found to notify.');
        }
        else {
            for (const admin of admins) {
                console.log(admin);
                if (admin.email) {
                    try {
                        yield (0, sendEmail_1.sendEmail)(admin.email, 'New Booking Notification', `A new booking has been made for maid ${maid.name} by user ${userId}.`);
                    }
                    catch (error) {
                        console.error(`Failed to send email to admin: ${admin.email}`);
                    }
                }
                else {
                    console.warn(`Admin with ID ${admin.id} has no associated user or email.`);
                }
            }
        }
        return result;
    }));
});
exports.HelperServices = {
    createHelper,
    bulkCreateHelpers,
    getAllHelpers,
    updateHelper,
    deleteHelper,
    addHelperToFavorites,
    removeHelperFromFavorites,
    bookHelper,
};
