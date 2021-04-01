// Firebase Storageに画像などのデータをアップロードするAPI
// ↓ を参照しました
// https://github.com/yuneco/portfolio/blob/master/src/admin/api/ImageUploaderApi.js

import firebase from '../firebase'
import Util from './Util'

const PUBLIC_IMG_DIR = '/public/imgs'
const DEFAULT_SUBDIR = 'default'
const MAX_IMAGE_SIZE_MB = 0.8
const MAX_WIDTH_OR_HEIGHT = 320

class UploaderApi {
  constructor () {
    this.storage = firebase.storage()
  }

  /**
   * 指定したパスのストレージ領域への参照を返します
   * @param {String} dir 任意のディレクトリ
   * @param {String} name ファイル名
   * @return {StorageRef}
   */
  _createStorageRef (path, name) {
    if (!path) {
      throw new Error('param path is required')
    }
    if (!name || name.includes('/')) {
      throw new Error(`invalid param name: #${name}`)
    }
    return this.storage.ref().child(`${PUBLIC_IMG_DIR}/${path}/${name}`)
  }

  /**
   * 指定したImgデータをユーザのディレクトリ内にアップロードします。
   * @param {File} imgFile
   * @param {String} dir optional アップ先ディレクトリ
   * @param {String} name optional ファイル名。省略するとランダムに設定されます
   * @param {function} onStatusChanged optional 進捗更新時に呼ばれます
   * @return {Promise} 成功時はthen(url=>{})でダウンロードURLが取得できます
   */
  async uploadImageFile (imgFile, dir = DEFAULT_SUBDIR, name = null, onStatusChanged = null) {
    const rndName = `${Date.now()}_${Math.floor(Math.random() * 1000)}`
    const actualName = name || rndName
    const ref = this._createStorageRef(dir, actualName)

    console.log('origin file:', imgFile.name)
    console.log('       size:', imgFile.size)
    const compressedImageFile = await Util.Utils.compressImageFile(imgFile, MAX_IMAGE_SIZE_MB, MAX_WIDTH_OR_HEIGHT)
    console.log('compressed size:', compressedImageFile.size)
    const task = ref.put(compressedImageFile)
    if (onStatusChanged) {
      task.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        const status = snapshot.state
        onStatusChanged(progress, status)
      })
    }
    const res = await task
    const url = await ref.getDownloadURL()
    console.log(' download URL:', url)
    return {
      url,
      dir,
      name: actualName,
      res
    }
  }

  async getUrlFromPath (path) {
    const ref = this.storage.ref().child(path)
    const url = await ref.getDownloadURL()
    return url
  }

  /**
   * 画像を削除します
   * @param {string} path
   */
  async deleteImage (dir = DEFAULT_SUBDIR, name) {
    const ref = this._createPhotoRef(dir, name)
    return ref.delete()
  }
}

export default {
  Uploader: new UploaderApi()
}
