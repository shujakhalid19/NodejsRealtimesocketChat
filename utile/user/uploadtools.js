const aws = require('aws-sdk');
const {nanoid}=require('nanoid');
require('dotenv').config();

const s3 = new aws.S3({
    region:process.env.AWS_REGION,
    accessKeyId:process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    signatureVersion:'v4'
})

const getSecureURL=async (req,res)=>{
    var key=nanoid(25).replace('_','x').replace('-','y');
    const imagename=key;
    const params=({
        Bucket:'bucketeer-873994af-d5d2-4ecb-b8cc-1be3de8b052a',
        Key:imagename,
        Expires:50
    })
    try {
        const uploadurl=await s3.getSignedUrlPromise('putObject',params);
        res.send({state:true,err:false,url:uploadurl});
    } catch (error) {
        console.log(error);
        res.send({state:false,err:true});
    }
    return;
}

module.exports={
    getSecureURL
}