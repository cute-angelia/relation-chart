/**
 * 将svg导出成图片
 * @param svg html  => document.querySelectorAll('#map')[0].innerHTML
 * @param name 生成的图片名称
 * @param width 生成的图片宽度
 * @param height 生成的图片高度
 * @param type 生成的图片类型
 */
export const covertSVG2Image = (svgXml, name, width, height, type = 'png') => {
  //let serializer = new XMLSerializer()
  //let source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(node)
  //let image = new Image()
  //image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)


  var image = new Image()
  image.src =
    'data:image/svg+xml;base64,' +
    window.btoa(unescape(encodeURIComponent(svgXml))) //给图片对象写入base64编码的svg流

  console.log(image.src);

  let canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  let context = canvas.getContext('2d')
  context.fillStyle = '#fff'
  context.fillRect(0, 0, 10000, 10000)

  //image.onload = function () {
  context.drawImage(image, 0, 0)
  let a = document.createElement('a')
  a.download = `${name}.${type}`
  a.href = canvas.toDataURL(`image/${type}`)
  a.click()
  //}
}