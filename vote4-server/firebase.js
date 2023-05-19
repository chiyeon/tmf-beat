/*
 * SETUP
 */
require('dotenv').config()

const { print } = require("./utils.js")

const { initializeApp } = require("firebase/app")
const { getFirestore, doc, setDoc, getDoc, query, collection, getDocs, deleteDoc } = require("firebase/firestore")

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG)
const firebase_app = initializeApp(firebaseConfig)
const db = getFirestore(firebase_app)

print("Connected to Firebase!")

/*
 * EXPORTS
 */

/**
 * Returns an entire collection as an object with document IDs
 * as keys and document data as values
 * @param   {String} collection_name   Name of Firebase Collection
 * @returns {Object}                   Collection mapped as document to data
 */
const get_collection = async (collection_name) => {
   let q = query(collection(db, collection_name))
   let q_snap = await getDocs(q)
   let output = {}

   q_snap.forEach(doc => {
      output[doc.id] = doc.data().target
   })

   return output
}

/**
 * Sets data of target document. Targts with a path, collection/document
 * @param {String} path Target Path (collection/document)
 * @param {Object} data New data to set
 */
const set_doc_path = async (path, data) => {
   let split_path = path.split("/")
   await set_doc(split_path[0], split_path[1], data)
}

/**
 * Sets data of target document.
 * @param {String} col_name   Name of Firebase Collection
 * @param {String} doc_name   ID of Firebase Document
 * @param {Object} data       New data to set
 */
const set_doc = async(col_name, doc_name, data) => {
   await setDoc(doc(db, col_name, doc_name), data)
}

/**
 * Returns data of document
 * @param   {String} col_name Name of Firebase Collection
 * @param   {String} doc_name ID of Firebase Document
 * @returns {Object}          Firebase Document Data
 */
const get_doc = async (col_name, doc_name) => {
   let doc_snap = await getDoc(doc(db, col_name, doc_name))

   if (doc_snap.exists()) 
      return doc_snap.data()
   return undefined
}

/**
 * Returns data of document
 * @param   {String} path Target Path (Collection/document)
 * @returns {Object}          Firebase Document Data
 */
const get_doc_path = async(path) => {
   let path_split = path.split("/")
   return get_doc(path_split[0], path_split[1])
}

/**
 * Deletes an entire collection
 * @param {String} col_name Name of Firebase Collection
 */
const delete_collection = async(col_name) => {
   const q = query(collection(db, col_name))
   const q_snap = await getDocs(q)

   q_snap.forEach(async (doc_name) => {
      await deleteDoc(doc(db, col_name, doc_name.id))
   })
}

/**
 * Deletes a Document
 * @param {String} col_name Name of Firebase Collection
 * @param {String} doc_name ID of Firebase Document
 */
const delete_doc = async(col_name, doc_name) => {
   await deleteDoc(doc(db, col_name, doc_name))
}

/**
 * Deletes a Document by path
 * @param {String} path Target path (Collection/Document)
 */
const delete_doc_path = async(path) => {
   let path_split = path.split("/")
   await delete_doc(path_split[0], path_split[1])
}

/*
 * bye bye !!
 */
module.exports = {
   get_collection,
   delete_collection,
   set_doc,
   set_doc_path,
   get_doc,
   get_doc_path,
   delete_doc,
   delete_doc_path
}