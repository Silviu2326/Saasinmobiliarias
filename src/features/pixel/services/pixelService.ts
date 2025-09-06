export interface Pixel {
  id: string;
  name: string;
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin' | 'twitter' | 'pinterest';
  pixelId: string;
  status: 'active' | 'inactive' | 'error';
  isActive: boolean;
  lastEventAt?: string;
  createdAt: string;
  updatedAt: string;
  snippet: string;
}

export interface PixelEvent {
  id: string;
  pixelId: string;
  eventName: string;
  sourceUrl: string;
  timestamp: string;
  data?: Record<string, any>;
  userAgent?: string;
  ip?: string;
}

export interface CreatePixelRequest {
  name: string;
  platform: Pixel['platform'];
  pixelId: string;
  isActive: boolean;
}

export interface UpdatePixelRequest {
  name?: string;
  pixelId?: string;
  isActive?: boolean;
}

// Mock data for development
const mockPixels: Pixel[] = [
  {
    id: '1',
    name: 'Meta Pixel Principal',
    platform: 'meta',
    pixelId: '123456789012345',
    status: 'active',
    isActive: true,
    lastEventAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    snippet: `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '123456789012345');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=123456789012345&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`
  },
  {
    id: '2',
    name: 'Google Ads Conversions',
    platform: 'google',
    pixelId: 'AW-123456789',
    status: 'active',
    isActive: true,
    lastEventAt: '2024-01-15T09:45:00Z',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-15T09:45:00Z',
    snippet: `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-123456789"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-123456789');
</script>`
  },
  {
    id: '3',
    name: 'TikTok Pixel',
    platform: 'tiktok',
    pixelId: 'ABCD1234EFGH5678',
    status: 'error',
    isActive: true,
    lastEventAt: '2024-01-10T14:20:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
    snippet: `<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('ABCD1234EFGH5678');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel Code -->`
  },
  {
    id: '4',
    name: 'LinkedIn Insight Tag',
    platform: 'linkedin',
    pixelId: '123456',
    status: 'inactive',
    isActive: false,
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
    snippet: `<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
_linkedin_partner_id = "123456";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script><script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=123456&fmt=gif" />
</noscript>
<!-- End LinkedIn Insight Tag -->`
  }
];

const mockEvents: PixelEvent[] = [
  {
    id: '1',
    pixelId: '1',
    eventName: 'PageView',
    sourceUrl: 'https://example.com/propiedades/piso-madrid-centro',
    timestamp: '2024-01-15T10:30:00Z',
    data: {
      page_title: 'Piso en Madrid Centro - 3 habitaciones',
      property_id: 'REF001',
      price: 450000
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ip: '192.168.1.1'
  },
  {
    id: '2',
    pixelId: '1',
    eventName: 'ViewContent',
    sourceUrl: 'https://example.com/propiedades/piso-madrid-centro',
    timestamp: '2024-01-15T10:28:00Z',
    data: {
      content_type: 'property',
      content_id: 'REF001',
      value: 450000,
      currency: 'EUR'
    }
  },
  {
    id: '3',
    pixelId: '1',
    eventName: 'Lead',
    sourceUrl: 'https://example.com/contacto',
    timestamp: '2024-01-15T10:25:00Z',
    data: {
      content_name: 'Contact Form',
      property_id: 'REF001',
      lead_type: 'contact'
    }
  },
  {
    id: '4',
    pixelId: '2',
    eventName: 'conversion',
    sourceUrl: 'https://example.com/gracias',
    timestamp: '2024-01-15T09:45:00Z',
    data: {
      transaction_id: 'TXN_12345',
      value: 450000,
      currency: 'EUR',
      conversion_label: 'property_inquiry'
    }
  }
];

class PixelService {
  private baseUrl = '/api/pixels';

  // Simulate API delay
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getPixels(): Promise<Pixel[]> {
    await this.delay();
    // In a real app, this would be: return fetch(`${this.baseUrl}`).then(res => res.json());
    return [...mockPixels];
  }

  async getPixel(id: string): Promise<Pixel | null> {
    await this.delay();
    // In a real app, this would be: return fetch(`${this.baseUrl}/${id}`).then(res => res.json());
    return mockPixels.find(pixel => pixel.id === id) || null;
  }

  async createPixel(data: CreatePixelRequest): Promise<Pixel> {
    await this.delay();
    
    const snippet = this.generateSnippet(data.platform, data.pixelId);
    
    const newPixel: Pixel = {
      id: Date.now().toString(),
      name: data.name,
      platform: data.platform,
      pixelId: data.pixelId,
      status: data.isActive ? 'active' : 'inactive',
      isActive: data.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      snippet
    };

    mockPixels.push(newPixel);
    return newPixel;
  }

  async updatePixel(id: string, data: UpdatePixelRequest): Promise<Pixel> {
    await this.delay();
    
    const pixelIndex = mockPixels.findIndex(pixel => pixel.id === id);
    if (pixelIndex === -1) {
      throw new Error('Pixel not found');
    }

    const updatedPixel = {
      ...mockPixels[pixelIndex],
      ...data,
      updatedAt: new Date().toISOString(),
      status: data.isActive !== undefined 
        ? (data.isActive ? 'active' : 'inactive')
        : mockPixels[pixelIndex].status
    };

    if (data.pixelId && data.pixelId !== mockPixels[pixelIndex].pixelId) {
      updatedPixel.snippet = this.generateSnippet(updatedPixel.platform, data.pixelId);
    }

    mockPixels[pixelIndex] = updatedPixel;
    return updatedPixel;
  }

  async deletePixel(id: string): Promise<void> {
    await this.delay();
    
    const pixelIndex = mockPixels.findIndex(pixel => pixel.id === id);
    if (pixelIndex === -1) {
      throw new Error('Pixel not found');
    }

    mockPixels.splice(pixelIndex, 1);
  }

  async getPixelEvents(pixelId: string, limit = 50): Promise<PixelEvent[]> {
    await this.delay();
    // In a real app, this would be: return fetch(`${this.baseUrl}/${pixelId}/events?limit=${limit}`).then(res => res.json());
    return mockEvents
      .filter(event => event.pixelId === pixelId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async testPixelConnection(pixelId: string): Promise<{ isConnected: boolean; message: string }> {
    await this.delay(1000);
    
    // Simulate connection test
    const success = Math.random() > 0.3; // 70% success rate for demo
    
    return {
      isConnected: success,
      message: success 
        ? 'Pixel está correctamente instalado y recibiendo eventos'
        : 'No se pudo detectar el pixel en el sitio web. Verifica la instalación.'
    };
  }

  private generateSnippet(platform: Pixel['platform'], pixelId: string): string {
    switch (platform) {
      case 'meta':
        return `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;

      case 'google':
        return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${pixelId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${pixelId}');
</script>`;

      case 'tiktok':
        return `<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${pixelId}');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel Code -->`;

      case 'linkedin':
        return `<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
_linkedin_partner_id = "${pixelId}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script><script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=${pixelId}&fmt=gif" />
</noscript>
<!-- End LinkedIn Insight Tag -->`;

      case 'twitter':
        return `<!-- Twitter Universal Website Tag Code -->
<script>
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('init','${pixelId}');
twq('track','PageView');
</script>
<!-- End Twitter Universal Website Tag Code -->`;

      case 'pinterest':
        return `<!-- Pinterest Tag -->
<script>
!function(e){if(!window.pintrk){window.pintrk = function () {
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
  n=window.pintrk;n.queue=[],n.version="3.0";var
  t=document.createElement("script");t.async=!0,t.src=e;var
  r=document.getElementsByTagName("script")[0];
  r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', '${pixelId}', {em: '<user_email_address>'});
pintrk('page');
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://ct.pinterest.com/v3/?tid=${pixelId}&event=init&noscript=1" />
</noscript>
<!-- End Pinterest Tag -->`;

      default:
        return `<!-- ${platform} Pixel - ID: ${pixelId} -->`;
    }
  }

  getPlatformInfo(platform: Pixel['platform']) {
    const platformMap = {
      meta: { name: 'Meta (Facebook)', color: 'blue', icon: '📘' },
      google: { name: 'Google Ads', color: 'red', icon: '🔍' },
      tiktok: { name: 'TikTok', color: 'black', icon: '🎵' },
      linkedin: { name: 'LinkedIn', color: 'blue', icon: '💼' },
      twitter: { name: 'Twitter (X)', color: 'black', icon: '🐦' },
      pinterest: { name: 'Pinterest', color: 'red', icon: '📌' }
    };

    return platformMap[platform] || { name: platform, color: 'gray', icon: '📊' };
  }
}

export const pixelService = new PixelService();