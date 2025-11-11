/**  
 * PathStorage is a module for storing annotated path objects persistently 
 * on your device using the AsyncStorage library for persistent device storage
 * 
 * Author: Lyn Turbak
 * Date: 2024/04/04
 * Version: 1.0
 */

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const pathStorePrefix = 'PathStorage_'

function makePathKey(ISOStartTimeString) {
  return pathStorePrefix + ISOStartTimeString; 
}


/** 
 * PathStorage.storePath(pathObj) stores pathObj persistently on the device. 
 * 
 * Behind the scenes it uses JSON.stringify to convert pathObj to a string, 
 * and then stores this string in AsyncStorage with a key that involves
 * the ISO start time string of the pathObj. 
 * 
 * You should call PathStorage.storePath in the Recording PseudoScreen as 
 * part of saving a recorded path. 
 */
export async function storePath(pathObj) {
  try {
    const pathJson = JSON.stringify(pathObj);
    const pathKey = makePathKey(pathObj.startTime);
    await AsyncStorage.setItem(pathKey, pathJson);
    console.log(`Successfully stored path with key ${pathKey}.`);
  } catch(err) {
    console.log(`Error when storing path with key ${pathKey}: ${JSON.stringify(Error)}`);
  }
}

/**
 * @returns an array of all the path keys in AsyncStorage. 
 */
async function getAllPathKeys() {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const allPathKeys = allKeys.filter(k => k.startsWith(pathStorePrefix));
    allPathKeys.sort(); // sort in ascending order by ISO time string.
    return allPathKeys;
  } catch(err) {
    Alert.alert(`Error in getAllPathKeys: ${JSON.stringify(Error)}. Returning the empty array`);
    return [];
  }
}

/**
 *  * @returns an array of all the pathObjects in AsyncStorage.
 */
export async function loadAllPaths() {
  try {
    const allPathKeys = await getAllPathKeys();
    const allPathKeyJsonPairs = await AsyncStorage.multiGet(allPathKeys);
    const allPathJsons = allPathKeyJsonPairs.map(([key,json]) => json);
    const allPathObjs = allPathJsons.map(JSON.parse);
    console.log(`Successfully loaded ${allPathObjs.length} paths.`);
    return allPathObjs;
  } catch(err) {
    Alert.alert(`Error in loadAllPaths: ${JSON.stringify(err)}. Returning the empty array`);
    return [];
  }
}

/**
 * PathStorage.loadPath(ISOStartTimeString) loads a path object from
 * AsyncStorage using a key that involves the path's ISO start time string.
 *
 * This is usually not called directly. Instead, it is called indirectly by
 * PathStore.init(), which loads all of the paths that have been saved on the
 * device.
 *
 * Behind the scenes, PathStore.loadPath reads the string contents of the
 * value associated with the ISO start time string and converts this string
 * to a path object using JSON.parse.
 */
export async function loadPath(ISOStartTimeString) {
  try {
    const pathKey = makePathKey(ISOStartTimeString);
    const pathJson = await AsyncStorage.getItem(pathKey);
    const pathObj = JSON.parse(pathJson);
    console.log(`Successfully loaded path from ${ISOStartTimeString}`);
    console.log(`Loaded path name is ${pathObj.name}`);
    // For debugging:
    // console.log(`Loaded path distance: ${pathObj.pathDistance}`);
    // console.log(`Actual path distance: ${(pathDistanceInMeters(pathObj.coords)/1000).toFixed(2)}`);
    return pathObj;
  } catch(err) {
    console.log(`Error when loading path from ${ISOStartTimeString}: ${JSON.stringify(err)}. Returning undefined for this path.`);
    return undefined;
  }
}

/**
 * PathStore.deletePath(pathObj) deletes pathObj from the persistent storage
 * on the device. You will need to use this function if you implement path
 * deletion.
 */
export async function deletePath(pathObj) {
  deletePathAtTime(pathObj.startTime);
}

/**
 * PathStorage.deletePathAtTime(ISOStartTimeString) deletes from the
 * device the path object with the given ISOStartTimeString.
 */
export async function deletePathAtTime(ISOStartTimeString) {
  try {
    const pathKey = makePathKey(ISOStartTimeString);
    await AsyncStorage.removeItem(pathKey);
    console.log(`Successfully deleted path with key ${pathKey}.`);
  } catch(err) {
    Alert.alert(`Error in deletePathAtTime(${ISOStartTimeString}): ${JSON.stringify(err)}.`);
  }
}

/**
 * PathStorage.deleteAllPaths(): deletes all path objects from the persistent
 * storage on the device. This is most useful when debugging, where it returns
 * the file system to the initial state where no paths are stored.
 */
export async function deleteAllPaths() {
  try {
    const allPathKeys = await getAllPathKeys();
    await AsyncStorage.multiRemove(allPathKeys);
    console.log(`Successfully deleted all paths`);
  } catch (err) {
    Alert.alert(`Error in deleteAllPaths: ${JSON.stringify(err)}.`);
  }
}