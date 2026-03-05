import { ofetch } from 'ofetch'
import type { SiteInfoResponse } from '@/types/icon'

const API_BASE = 'https://api.codelife.cc'

export async function fetchSiteInfo(url: string): Promise<SiteInfoResponse> {
  return ofetch<SiteInfoResponse>(`${API_BASE}/website/info`, {
    params: {
      lang: 'cn',
      url,
    },
  })
}
