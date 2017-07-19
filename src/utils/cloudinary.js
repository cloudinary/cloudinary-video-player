import cloudinary from 'cloudinary-core'

function getCloudinaryInstanceOf(constructorName, obj) {
  if (obj.constructor.name === constructorName) {
    return obj
  } else {
    return new cloudinary[constructorName](obj)
  }
}

export { getCloudinaryInstanceOf }
