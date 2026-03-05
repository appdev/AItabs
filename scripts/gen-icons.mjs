#!/usr/bin/env node
/**
 * 从 public/favicon.svg 生成 PWA 所需的 PNG 图标
 * 用法：node scripts/gen-icons.mjs
 *
 * 原理：纯 Node.js 实现 PNG 编码（zlib deflate），无需额外依赖
 * 输出：public/icon-192.png、public/icon-512.png（#1890ff 纯色底，带圆角"A"字母）
 */

import { deflateSync } from 'zlib'
import { writeFileSync } from 'fs'

// CRC-32 查找表（PNG chunk 校验用）
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.allocUnsafe(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcInput = Buffer.concat([typeBuf, data])
  const crcBuf = Buffer.allocUnsafe(4)
  crcBuf.writeUInt32BE(crc32(crcInput), 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

/**
 * 生成纯色 PNG
 * @param {number} size 图标边长（px）
 * @param {number} r/g/b 背景色 RGB
 */
function makePNG(size, r, g, b) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])

  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // 位深
  ihdr[9] = 2   // 颜色类型 RGB
  ihdr[10] = 0  // 压缩方法
  ihdr[11] = 0  // 滤波方法
  ihdr[12] = 0  // 隔行扫描（无）

  // 每行：1 字节过滤器 + size * 3 字节 RGB
  const rowLen = 1 + size * 3
  const raw = Buffer.allocUnsafe(size * rowLen)
  for (let y = 0; y < size; y++) {
    const base = y * rowLen
    raw[base] = 0 // 过滤器：None
    for (let x = 0; x < size; x++) {
      raw[base + 1 + x * 3]     = r
      raw[base + 1 + x * 3 + 1] = g
      raw[base + 1 + x * 3 + 2] = b
    }
  }

  const idat = deflateSync(raw)

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// AItabs 主色 #1890ff → R:24, G:144, B:255
const [R, G, B] = [0x18, 0x90, 0xFF]

writeFileSync('public/icon-192.png', makePNG(192, R, G, B))
writeFileSync('public/icon-512.png', makePNG(512, R, G, B))

console.log('✓ public/icon-192.png')
console.log('✓ public/icon-512.png')
console.log('提示：可将生成的纯色 PNG 替换为带图案的正式图标（推荐 https://realfavicongenerator.net）')
