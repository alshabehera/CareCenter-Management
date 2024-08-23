"use server";

import { ID,Query } from "node-appwrite"
import { BUCKET_ID, database, DATABASE_ID, ENDPOINT, PATIENT_COLLECTION_ID, PROJECT_ID, storage, users } from "../appwrite.config";
import { parseStringify } from "../utils";
import {InputFile} from "node-appwrite/file"

export  const createUser = async (user: CreateUserParams)=>{
   
   try{
        const newUser =await users.create(
        ID.unique(),
        user.email,
        user.phone,
        undefined,
        user.name,
       
    );

   console.log(newUser);
    return parseStringify(newUser);

   } catch(error:any){
        if(error && error?.code ===409){
            const documents=await users.list([
                Query.equal('email', [user.email])
            ]);
            return documents?.users[0]
        }
        console.error("An error occurred while creating a new user:", error);
   } 

};

export const getUser =async (userId:string) =>{
    try{ 
        const user =await users.get(userId);

        return parseStringify(user)

    }catch(error){
        console.log(error)

    }
};

export const getPatient =async(userId: string)=>{
   
        try{ 
            const patients =await database.listDocuments(
                DATABASE_ID!,
                PATIENT_COLLECTION_ID!,
                [Query.equal('userId',[userId])]
                
            );
            console.log(patients.documents[0])
            return parseStringify(patients.documents[0])
    
        }catch(error){
            console.error(
                
                error
              );
    
        }
    
}

export const registerPatient = async ({identificationDocument,...patient}:RegisterUserParams)=>{
    try{
        let file;

        if(identificationDocument){
            const inputFile= identificationDocument && InputFile.fromBuffer(
                identificationDocument?.get('blobFile') as Blob,
                identificationDocument?.get('fileName') as string,
            );

            file =await storage.createFile(BUCKET_ID!,ID.unique(),inputFile)
        }
        const newPatient=await database.createDocument (
            DATABASE_ID!,
            PATIENT_COLLECTION_ID!,
            ID.unique(),
            {
                    identificationDocumentId:  file?.$id || null,
                    identificationDocumentUrl: `${ENDPOINT}/storage/bucket/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
                    ...patient}
        )
        return parseStringify(newPatient)
    }
    catch(error){
        console.log(error)
    }
}

