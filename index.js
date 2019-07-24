'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');

const BUCKET = process.env.BUCKET;
const URL = process.env.URL;

exports.handler = function (event, context, callback) {
  const name = event.queryStringParameters.name;
  const quality = event.queryStringParameters.quality;
  const ext = name.split('.').reverse()[0];

  S3.getObject({ Bucket: BUCKET, Key: name }).promise()
    .then(data => {
        const image = Sharp(data.Body);
      switch (ext) {
        case 'jpg':
        case 'jpeg':
        case 'JPG':
        case 'JPEG':
          return image.jpeg({
            quality: quality || 75
          });
          break;
        case 'png':
        case 'PNG':
          return image.png({
            quality: 75,
            compressionLevel: quality,
            adaptiveFiltering: true,
            force: true
          });
          break;
       }
      }
    )
    .then(buffer => S3.putObject({
      Body: buffer,
      Bucket: BUCKET,
      ContentType: `image/${ext.toLowerCase()}`,
      Key: key,
    }).promise()
    )
    .then(() => callback(null, {
      statusCode: '301',
      headers: { 'location': `${URL}/${key}` },
      body: '',
    })
    )
    .catch(err => callback(err))
}
