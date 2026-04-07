
// modules/currencyWidget.js

import { fetchCurrencyRates } from '../api/currency.js';
import { CONFIG } from '../config.js';
import { formatRate } from '../utils/formatter.js';
import { renderError } from '../utils/errorHandler.js';

export async function initCurrencyWidget() {
  const container = document.getElementById('currency-widget');

  try {
    const data = await fetchCurrencyRates();
    const rates = data.conversion_rates;

    let rows = CONFIG.FX_PAIRS.map(pair => {
      const ghsPerUnit = rates[pair.code] ? (1 / rates[pair.code]) : null;
      return { ...pair, ghsPerUnit };
    }).filter(p => p.ghsPerUnit !== null);

    container.innerHTML = `
      <table class="fx-table">
        <thead>
          <tr>
            <th>Pair</th>
            <th style="text-align:right">1 Unit → GHS</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(pair => `
            <tr>
              <td>
                <div class="fx-pair">
                  <span class="fx-flag">${pair.flag}</span>
                  <div>
                    <span class="fx-code">${pair.code}</span>
                    <span class="fx-name">${pair.name}</span>
                  </div>
                </div>
              </td>
              <td class="fx-rate">${formatRate(pair.ghsPerUnit)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="font-size:0.65rem; color:var(--text-secondary); margin-top:var(--space-sm);">
        1 unit of foreign currency → GHS · Updated: ${data.time_last_update_utc?.split(' 00:')[0] ?? 'N/A'}
      </p>
    `;

    return rows;
  } catch (err) {
    console.error('[Currency]', err);
    renderError('currency-widget', 'FX rates unavailable', initCurrencyWidget);
    return [];
  }
}
