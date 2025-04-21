

import * as directQueries from './directQueries';

export async function fetchSparks(limit = 20, skip = 0) {
  try {
    const sparks = await directQueries.fetchSparks(limit, skip);
    return sparks;
  } catch (error) {
    console.error('Error fetching sparks:', error);
    throw error;
  }
}

export async function fetchUserSparks(userAddress, limit = 20, skip = 0) {
  try {
    const sparks = await directQueries.fetchUserSparks(userAddress, limit, skip);
    return sparks;
  } catch (error) {
    console.error('Error fetching user sparks:', error);
    throw error;
  }
}

export async function fetchSparkById(sparkId) {
  try {
    const spark = await directQueries.fetchSparkById(sparkId);
    return spark;
  } catch (error) {
    console.error('Error fetching spark by ID:', error);
    throw error;
  }
}

export async function fetchRebounds(sparkId, limit = 20, skip = 0) {
  try {
    const rebounds = await directQueries.fetchRebounds(sparkId, limit, skip);
    return rebounds;
  } catch (error) {
    console.error('Error fetching rebounds:', error);
    throw error;
  }
}

export async function fetchUserOrbitData(userAddress) {
  try {
    const orbitData = await directQueries.fetchUserOrbitData(userAddress);
    return orbitData;
  } catch (error) {
    console.error('Error fetching user orbit data:', error);
    return { orbits: [], orbiters: [] };
  }
}

export async function isUserOrbiting(userAddress, targetAddress) {
  try {
    const isFollowing = await directQueries.isUserOrbiting(userAddress, targetAddress);
    return isFollowing;
  } catch (error) {
    console.error('Error checking if user is orbiting:', error);
    return false;
  }
}
