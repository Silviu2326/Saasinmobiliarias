import React from 'react';
import { Globe, Settings } from 'lucide-react';
import type { ChannelRule } from '../types';
import { formatMoney, calculateChannelPrice } from '../utils';

interface ChannelPriceMappingProps {
  channels: ChannelRule[];
  currentPrice: number;
  onPreview: (price: number, channelIds: string[]) => void;
}

const ChannelPriceMapping: React.FC<ChannelPriceMappingProps> = ({
  channels,
  currentPrice,
  onPreview
}) => {
  const mockChannels: ChannelRule[] = [
    { channel: 'idealista', name: 'Idealista', rounding: '99', currency: 'EUR', active: true },
    { channel: 'fotocasa', name: 'Fotocasa', rounding: '95', currency: 'EUR', active: true },
    { channel: 'habitaclia', name: 'Habitaclia', rounding: '000', currency: 'EUR', active: false }
  ];

  const data = channels.length > 0 ? channels : mockChannels;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Mapeo por Canal</h3>
      </div>

      <div className="space-y-4">
        {data.map((channel) => {
          const channelPrice = calculateChannelPrice(currentPrice, channel);
          
          return (
            <div key={channel.channel} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={channel.active}
                  readOnly
                  className="rounded"
                />
                <div>
                  <p className="font-medium text-gray-900">{channel.name}</p>
                  <p className="text-sm text-gray-600">
                    Redondeo: {channel.rounding} • {channel.currency}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatMoney(channelPrice, channel.currency)}
                </p>
                {channelPrice !== currentPrice && (
                  <p className="text-xs text-gray-500">
                    ({channelPrice > currentPrice ? '+' : ''}{formatMoney(channelPrice - currentPrice)})
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onPreview(currentPrice, data.filter(c => c.active).map(c => c.channel))}
        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Vista previa en canales
      </button>
    </div>
  );
};

export default ChannelPriceMapping;