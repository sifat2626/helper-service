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
exports.HelperServices = exports.createHelper = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const service_service_1 = require("../service/service.service");
const uploadToDigitalOcean_1 = require("../../utils/uploadToDigitalOcean");
const checkReference_1 = require("../../utils/checkReference");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const client_1 = require("@prisma/client");
const sendEmail_1 = require("../../utils/sendEmail");
const createHelper = (helperData, photo, biodata) => __awaiter(void 0, void 0, void 0, function* () {
    // Start a Prisma transaction
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const existingMaid = yield prisma.maid.findUnique({
            where: { email: helperData.email },
        });
        if (existingMaid) {
            throw new Error('A maid with this email already exists.');
        }
        let serviceId = yield service_service_1.Services.getServiceIdByName(helperData.serviceName);
        if (!serviceId) {
            const service = yield service_service_1.Services.createService(helperData.serviceName);
            serviceId = service.id;
        }
        let photoUrl = '';
        let biodataUrl = '';
        if (photo) {
            photoUrl = yield (0, uploadToDigitalOcean_1.uploadFileToDigitalOcean)(photo, 'maids/photos');
        }
        if (biodata) {
            biodataUrl = yield (0, uploadToDigitalOcean_1.uploadFileToDigitalOcean)(biodata, 'maids/biodatas');
        }
        const maid = yield prisma.maid.create({
            data: {
                name: helperData.name,
                email: helperData.email,
                age: helperData.age,
                experience: helperData.experience,
                serviceId,
                photo: photoUrl,
                biodataUrl,
                availability: helperData.availability,
            },
        });
        return maid;
    }));
    return result;
});
exports.createHelper = createHelper;
const bulkCreateHelpers = (helpers) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = [];
    let successCount = 0;
    for (const helper of helpers) {
        try {
            // Check if the service exists
            let service = yield prisma_1.default.service.findUnique({
                where: { name: helper.serviceName },
            });
            // Create the service if it doesn't exist
            if (!service) {
                service = yield prisma_1.default.service.create({
                    data: { name: helper.serviceName },
                });
            }
            // Use upsert to either create or update the helper
            const result = yield prisma_1.default.maid.upsert({
                where: { email: helper.email },
                update: {
                    name: helper.name,
                    age: Number(helper.age),
                    experience: Number(helper.experience),
                    serviceId: service.id,
                    availability: helper.availability.toString().toLowerCase() === 'true',
                    photo: helper.photo || '', // Default to empty string if not provided
                    biodataUrl: helper.biodataUrl || '', // Default to empty string if not provided
                },
                create: {
                    name: helper.name,
                    email: helper.email,
                    age: Number(helper.age),
                    experience: Number(helper.experience),
                    serviceId: service.id,
                    availability: helper.availability.toString().toLowerCase() === 'true',
                    photo: helper.photo || '', // Default to empty string if not provided
                    biodataUrl: helper.biodataUrl || '', // Default to empty string if not provided
                },
            });
            console.log(result.email === helper.email
                ? `Helper updated: ${result.name}`
                : `Helper created: ${result.name}`);
            successCount++; // Increment success count
        }
        catch (error) {
            // Handle individual helper error
            errors.push(`Failed to insert or update helper with email ${helper.email}: ${error.message}`);
        }
    }
    // Return the results
    return { successCount, errors };
});
const getAllHelpers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = 10, page = 1, minAge, maxAge, experience, serviceId, availability, name, id, email, } = query;
    // Step 1: Validate if the user exists
    // const user = await prisma.user.findUnique({
    //   where: {
    //     id: userId,
    //   },
    // });
    //
    // if (!user) {
    //   throw new AppError(400, 'User does not exist');
    // }
    // Step 2: Build dynamic filters based on query parameters
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
            gte: Number(minAge), // Greater than or equal to minAge
            lte: Number(maxAge), // Less than or equal to maxAge
        };
    }
    else if (minAge) {
        filters.age = {
            gte: Number(minAge),
        };
    }
    else if (maxAge) {
        filters.age = {
            lte: Number(maxAge),
        };
    }
    if (experience) {
        filters.experience = {
            gte: Number(experience),
        };
    }
    if (serviceId) {
        filters.serviceId = serviceId;
    }
    if (availability !== undefined) {
        filters.availability = availability.toString() === 'true'; // Convert to boolean
    }
    // Step 3: Calculate pagination details
    const take = Number(limit); // Number of records per page
    const skip = (Number(page) - 1) * take; // Offset for pagination
    // Step 4: Fetch total count of filtered helpers
    const totalHelpers = yield prisma_1.default.maid.count({
        where: filters, // Apply filters here
    });
    // Step 5: Fetch filtered and paginated helpers
    const helpers = yield prisma_1.default.maid.findMany({
        where: filters, // Apply filters here
        skip: skip,
        take: take,
    });
    // Step 6: Prepare meta data
    const meta = {
        total: totalHelpers,
        limit: take,
        page: Number(page),
        totalPages: Math.ceil(totalHelpers / take),
    };
    // Step 7: Return result with meta data
    return {
        meta,
        data: helpers,
    };
});
const updateHelper = (id, helperData, photo, biodata) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the helper exists
    const existingHelper = yield prisma_1.default.maid.findUnique({
        where: { id },
    });
    if (!existingHelper) {
        throw new AppError_1.default(404, 'Helper not found.');
    }
    // Handle service validation
    let serviceId = existingHelper.serviceId; // Default to current serviceId
    if (helperData.serviceName) {
        const service = yield prisma_1.default.service.findUnique({
            where: { name: helperData.serviceName },
        });
        if (!service) {
            // Create a new service if not found
            const newService = yield prisma_1.default.service.create({
                data: { name: helperData.serviceName },
            });
            serviceId = newService.id;
        }
        else {
            serviceId = service.id;
        }
    }
    const photoUrl = photo
        ? yield (0, uploadToDigitalOcean_1.uploadFileToDigitalOcean)(photo, 'maids/photos')
        : existingHelper.photo; // Retain the existing photo URL if no new file
    // Handle biodata upload
    const biodataUrl = biodata
        ? yield (0, uploadToDigitalOcean_1.uploadFileToDigitalOcean)(biodata, 'maids/biodatas')
        : existingHelper.biodataUrl; // Retain the existing biodata URL if no new file
    const updatedHelperdata = {};
    if (helperData.name) {
        updatedHelperdata.name = helperData.name;
    }
    if (helperData.email) {
        updatedHelperdata.email = helperData.email;
    }
    if (helperData.serviceName) {
        updatedHelperdata.serviceId = serviceId;
    }
    if (photoUrl) {
        updatedHelperdata.photo = photoUrl;
    }
    if (biodataUrl) {
        updatedHelperdata.biodataUrl = biodataUrl;
    }
    if (helperData.availability) {
        updatedHelperdata.availability = helperData.availability;
    }
    // Update the helper data
    const updatedHelper = yield prisma_1.default.maid.update({
        where: { id },
        data: Object.assign({}, updatedHelperdata),
    });
    return updatedHelper;
});
const deleteHelper = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const referencingModels = [
        { model: 'booking', field: 'maidId' },
        { model: 'favorite', field: 'maidId' },
    ];
    const isReferenced = yield (0, checkReference_1.isDataReferenced)('maid', 'id', id, referencingModels);
    if (isReferenced) {
        throw new Error('This maid cannot be deleted because it is referenced in other records.');
    }
    return prisma_1.default.maid.delete({
        where: { id },
    });
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
    createHelper: exports.createHelper,
    bulkCreateHelpers,
    getAllHelpers,
    updateHelper,
    deleteHelper,
    addHelperToFavorites,
    removeHelperFromFavorites,
    bookHelper
};
