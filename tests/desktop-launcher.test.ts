import { describe, expect, it } from 'vitest'
import {
  isLaunchableUrl,
  schemeOf,
} from '../src/modules/desktop-launcher/client.ts'

describe('isLaunchableUrl', () => {
  it('accepts https URLs', () => {
    expect(isLaunchableUrl('https://example.com')).toBe(true)
  })

  it('accepts http URLs', () => {
    expect(isLaunchableUrl('http://example.com/path')).toBe(true)
  })

  it('accepts mailto URLs', () => {
    expect(isLaunchableUrl('mailto:user@example.com')).toBe(true)
  })

  it('trims whitespace before checking', () => {
    expect(isLaunchableUrl('  https://example.com  ')).toBe(true)
  })

  it('rejects javascript:', () => {
    expect(isLaunchableUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects file:', () => {
    expect(isLaunchableUrl('file:///etc/passwd')).toBe(false)
  })

  it('rejects data:', () => {
    expect(isLaunchableUrl('data:text/plain,hello')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isLaunchableUrl('')).toBe(false)
    expect(isLaunchableUrl('   ')).toBe(false)
  })
})

describe('schemeOf', () => {
  it('detects https', () => {
    expect(schemeOf('https://example.com')).toBe('https')
  })

  it('detects http', () => {
    expect(schemeOf('http://example.com')).toBe('http')
  })

  it('detects mailto', () => {
    expect(schemeOf('mailto:user@example.com')).toBe('mailto')
  })

  it('reports other for unknown schemes', () => {
    expect(schemeOf('file:///etc/passwd')).toBe('other')
    expect(schemeOf('not a url')).toBe('other')
  })

  it('normalises case', () => {
    expect(schemeOf('HTTPS://Example.Com')).toBe('https')
    expect(schemeOf('MAILTO:user@example.com')).toBe('mailto')
  })
})