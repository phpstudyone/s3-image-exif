# s3-image-exif

This plugin depends on the exiftool tool. Before using this plugin, please download and install exiftool. For more exiftool information, please refer to [exiftool](https://exiftool.org/)

```js
  const {downloadS3Image,exif,getCaptureDate,unlink} = require('./s3-image-exif');
  const downloadPath = `${you want to downlod to path}`;
  const imageS3 = await downloadS3Image(`${your S3 bucket}`, `${your image key}`, downloadPath);
  console.log(imageS3);
  const execExif = await exif(downloadPath);
  console.log(execExif);
  const captureDate = getCaptureDate(execExif.exifInfo);
  console.log(execExif, captureDate);
  unlink(downloadPath);
```
