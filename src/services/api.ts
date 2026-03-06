import { ofetch } from 'ofetch'
import type { SiteInfoResponse } from '@/types/icon'

export async function fetchSiteInfo(url: string, refresh = false): Promise<SiteInfoResponse> {
  return ofetch<SiteInfoResponse>('/api/site/info', {
    params: { url, ...(refresh ? { refresh: '1' } : {}) },
  })
}
