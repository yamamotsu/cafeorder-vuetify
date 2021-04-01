
import imageCompression from 'browser-image-compression'

export class Util {
  static formatMonth2Str(month) {
    // month は1から始まる形式
    switch (month) {
      case 1:
        return "Jan";
      case 2:
        return "Feb";
      case 3:
        return "Mar";
      case 4:
        return "Apr";
      case 5:
        return "May";
      case 6:
        return "Jun";
      case 7:
        return "Jul";
      case 8:
        return "Aug";
      case 9:
        return "Sep";
      case 10:
        return "Oct";
      case 11:
        return "Nov";
      case 12:
        return "Dec";
      default:
        throw "ERROR";
    }
  }

  /**
   * compress the image file
   * @param {File} imgFile image file
   * @param {Number} maxFileSizeMB
   * @param {Number} maxWidthOrHeight
   * @return {Promise<File>} compressed image file
   */
  static async compressImageFile(imgFile, maxFileSizeMB, maxWidthOrHeight){
    const options = {
      maxSizeMB: maxFileSizeMB,
      maxWidthOrHeight: maxWidthOrHeight
    }
    return await imageCompression(imgFile, options)
  }
}

export default {
  Utils: Util
}
