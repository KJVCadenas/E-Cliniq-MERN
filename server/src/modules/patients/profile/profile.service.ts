import { PatientProfile } from './profile.model';
import { PatientProfileInput } from './profile.validation';
import { Types } from 'mongoose';

/**
 * Create a new patient profile
 * @param userId User's ID (as string)
 * @param data Validated profile data
 */
export const createProfileService = async (
  userId: string,
  data: PatientProfileInput
) => {
  const existing = await PatientProfile.findOne({
    userId: new Types.ObjectId(userId),
  });
  if (existing) {
    throw new Error('Profile already exists');
  }
  const created = await PatientProfile.create({
    ...data,
    userId: new Types.ObjectId(userId),
  });
  return created.toObject();
};

/**
 * Retrieve own profile by user ID
 */
export const getOwnProfileService = async (userId: string) => {
  return await PatientProfile.findOne({
    userId: new Types.ObjectId(userId),
  }).lean();
};

/**
 * Retrieve any profile by profile document ID
 */
export const getProfileService = async (profileId: string) => {
  if (!Types.ObjectId.isValid(profileId)) throw new Error('Invalid profile ID');
  return await PatientProfile.findById(profileId).lean();
};

/**
 * Update an existing profile by ID
 */
export const updateProfileService = async (
  profileId: string,
  data: PatientProfileInput
) => {
  if (!Types.ObjectId.isValid(profileId)) throw new Error('Invalid profile ID');
  const updated = await PatientProfile.findByIdAndUpdate(
    profileId,
    { $set: data },
    { new: true }
  ).lean();
  return updated;
};
