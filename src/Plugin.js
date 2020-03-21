const aws = require('aws-sdk');
const { exec } = require('child_process');
const fs = require('fs');

aws.config.update({
    region     : 'us-east-1',
    httpOptions: {
        timeout: 20000 * 60 * 1000,
    },
});

/**
 * get image's exif info
 * @param {String} path image file path
 */
const exif = async (path)=> {
    const cmdStr = `exiftool ${path}`;
    return new Promise((resolve) => {
        exec(cmdStr, (err,stdout) => {
            if (err) {
                resolve({status:false})
            } else {
                resolve({status:true,exifInfo:stdout})
           }
        })
    })
}

/**
 * Convert a date in the form `2011:04:17 15:23:44` to a date `2011-04-17 15:23:44`
 * @param {string} fromDateStr
 */
const dateFormat = (fromDateStr) => {
    const fromDateStrInt = parseInt(fromDateStr.replace(/[: ]/g, ''));
    const toDateStr = `${fromDateStrInt}`.replace(/(.{4})(.{2})(.{2})(.{2})(.{2})/, "$1-$2-$3 $3:$4:");
    return toDateStr;
}

/**
 * get image's capture date from image exif info.
 * @param {String} exifInfo  image exif info
 */
const getCaptureDate = (exifInfo) => {
    const originalDate = exifInfo.match(/Date\/Time Original[ \t]+: (\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2})/);
    if (originalDate) {
        return dateFormat(originalDate[1])
    }
    let dateStringArr = [...exifInfo.matchAll(/(\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2})/g)];
    const dateIntArr = dateStringArr.map((v) => parseInt(v[0].replace(/[: ]/g, '')));
    const dateInt = dateIntArr.sort((a, b) => a - b)[0];
    return `${dateInt}`.replace(/(.{4})(.{2})(.{2})(.{2})(.{2})/, "$1-$2-$3 $3:$4:");
}

/**
 * download image file to ${dowloadPath} from AWS.S3
 * @param {String} Bucket s3 image BucketName
 * @param {String} Key s3 image ObjectKey
 * @param {String} dowloadPath download path
 */
const downloadS3Image = async (Bucket,Key,dowloadPath)=>{
    return new Promise((resolve) => {
        const s3 = new aws.S3();
        const param = {
            Bucket: Bucket,
            Key   : Key,
        };
        s3.getObject(param, (error, data) => {
            if (error) {
                resolve({status:false,errorText: error.message});
            } else {
                fs.writeFileSync(dowloadPath, data.Body);
                resolve({status:true,imagePath: dowloadPath});
            }
        });
    });
}
/**
 * delete file
 * @param {String} filePath
 */
const unlink = (filePath) => {
    fs.unlinkSync(filePath);
}
module.exports.downloadS3Image = downloadS3Image;
module.exports.exif = exif;
module.exports.getCaptureDate = getCaptureDate;
module.exports.unlink = unlink;