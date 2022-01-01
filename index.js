//  COPYRIGHT:       DouHub Inc. (C) 2021 All Right Reserved
//  COMPANY URL:     https://www.douhub.com/
//  CONTACT:         developer@douhub.com
// 
//  This source is subject to the DouHub License Agreements. 
// 
//  Our EULAs define the terms of use and license for each DouHub product. 
//  Whenever you install a DouHub product or research DouHub source code file, you will be prompted to review and accept the terms of our EULA. 
//  If you decline the terms of the EULA, the installation should be aborted and you should remove any and all copies of our products and source code from your computer. 
//  If you accept the terms of our EULA, you must abide by all its terms as long as our technologies are being employed within your organization and within your applications.
// 
//  THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY
//  OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT
//  LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
//  FITNESS FOR A PARTICULAR PURPOSE.
// 
//  ALL OTHER RIGHTS RESERVED

'use strict';

import _ from '../../../libs/helper';
const AWS = require('aws-sdk');
const s3 = new AWS.S3();


export const processVideo = async (event, context, callback) => {

    if (_.callFromAWSEvents(event)) return;
    if (_track) console.log(JSON.stringify(event));

    const result = await _.processSNSRecords(event.Records, async (record) => {
        try {
            for (var i = 0; i < record.Records.length; i++) {
                await processInternal(record.Records[i]);
            }
        }
        catch (ex) {
            console.error(ex);
        }
    });

    if (_track) console.log({ result });
}

const processInternal = async (record) => {

    const fileFullName = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    const fileFullNameInfo = fileFullName.split('/'); //array that has folders and fileName
    const fileName = fileFullNameInfo.splice(-1)[0]; // something.mp4
    const fileNameBase = fileName.substring(0, fileName.indexOf('.mp4'));  //fila name without mp4 extension, something
    const fileFolder = fileFullNameInfo.length == 0 ? '' : fileFullNameInfo.join('/');

    if (!_.isNonEmptyString(fileFolder)) throw new Error('The file has to be in a folder.');
    if (_track) console.log({ fileFullName, fileFolder, fileName, fileNameBase });

    const bucket = `${record.s3.bucket.name}-m3u8`;

    //get all files in the folder, and delete all
    const files = await (() => {
        return new Promise((resolve, reject) => {
            s3.listObjects({
                Bucket: bucket,
                MaxKeys: 1000,
                Prefix: `${fileFolder}/`,
            }, function (err, data) {
                if (err) {
                    console.error(err, err.stack); // an error occurred
                    reject(err);
                }
                else {
                    resolve(data.Contents);
                }
            });
        });
    })();

    if (_track) console.log({files: JSON.stringify(files)});

    for (var i = 0; i < files.length; i++) {
        const file = files[i];
        await (() => {
            return new Promise((resolve, reject) => {
                s3.deleteObject({
                    Bucket: bucket,
                    Key: file.Key
                }, function (err, data) {
                    if (err) {
                        console.error(err); // an error occurred
                        reject(err);
                    }
                    else {
                        resolve(data.Contents);
                    }
                });
            });
        })();
    }

}

