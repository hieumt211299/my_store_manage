import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  fetchRevenueData,
  getRevenueSummary,
  groupRevenueByDate,
  getRevenueSourceDistribution,
  getRevenueStatusDistribution,
  CashflowSource,
  CashflowSourceLabels,
  CashflowSourceColors,
  CashflowDirection,
  CashflowDirectionLabels,
  getTimePeriodOptions,
  getMonthOptions,
  formatCurrency,
  formatNumber,
  formatDateForDisplay,
} from '../../utils/analytics';


const SOURCE_DETAIL_PATHS = {
  [CashflowSource.ORDER]: '/orders',
  [CashflowSource.IMPORT_ORDER]: '/imports',
  [CashflowSource.ORDER_RESALE]: '/order-resales',
  [CashflowSource.IMPORT_ORDER_RESALE]: '/import-order-resales',
};

const summaryCardConfigs = [
  {
    key: 'netCashflow',
    label: 'Dòng tiền ròng',
    gradient: 'from-slate-900 to-slate-700',
    icon: '◈',
    valueClassName: 'text-white',
  },
  {
    key: 'totalInflow',
    label: 'Tổng tiền vào',
    gradient: 'from-emerald-500 to-green-600',
    icon: '+',
    valueClassName: 'text-white',
  },
  {
    key: 'totalOutflow',
    label: 'Tổng tiền ra',
    gradient: 'from-rose-500 to-red-600',
    icon: '-',
    valueClassName: 'text-white',
  },
  {
    key: 'totalTransactions',
    label: 'Số giao dịch',
    gradient: 'from-sky-500 to-blue-600',
    icon: '#',
    valueClassName: 'text-white',
  },
];

const formatSummaryValue = (key, value) => (
  key === 'totalTransactions' ? formatNumber(value) : formatCurrency(value)
);

const getTransactionDetailPath = (transaction) =>
  `${SOURCE_DETAIL_PATHS[transaction.source] || '/reports/revenue'}/${transaction.reference_id}`;

function RevenueReport() {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const timePeriodOptions = useMemo(() => getTimePeriodOptions(), []);
  const monthOptions = useMemo(() => getMonthOptions(), []);

  const invalidCustomRange =
    selectedPeriod === 'custom' &&
    customStartDate &&
    customEndDate &&
    new Date(customStartDate) > new Date(customEndDate);

  const dateRange = useMemo(() => {
    const selectedOption = timePeriodOptions.find((option) => option.key === selectedPeriod);

    if (selectedPeriod === 'custom') {
      if (customStartDate && customEndDate && !invalidCustomRange) {
        return {
          startDate: new Date(customStartDate),
          endDate: new Date(`${customEndDate}T23:59:59`),
        };
      }
      return null;
    }

    if (selectedPeriod === 'month' && selectedMonth) {
      const monthOption = monthOptions.find((option) => option.value === selectedMonth);
      return monthOption
        ? {
            startDate: monthOption.startDate,
            endDate: monthOption.endDate,
          }
        : null;
    }

    return selectedOption?.getValue() || null;
  }, [
    customEndDate,
    customStartDate,
    invalidCustomRange,
    monthOptions,
    selectedMonth,
    selectedPeriod,
    timePeriodOptions,
  ]);

  const fetchData = useCallback(async () => {
    if (!dateRange) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      const data = await fetchRevenueData(dateRange.startDate, dateRange.endDate);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching cashflow data:', error);
      setMessage(`Lỗi tải dữ liệu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (dateRange) {
      fetchData();
    }
  }, [dateRange, fetchData]);

  const summary = useMemo(() => getRevenueSummary(transactions), [transactions]);
  const trendData = useMemo(() => groupRevenueByDate(transactions), [transactions]);
  const sourceData = useMemo(() => getRevenueSourceDistribution(transactions), [transactions]);
  const statusData = useMemo(() => getRevenueStatusDistribution(transactions), [transactions],);

  const recentTransactions = useMemo(
    () => transactions.slice(0, 12),
    [transactions],
  );

  const sourceCards = useMemo(
    () =>
      Object.entries(summary.sourceBreakdown || {}).map(([source, value]) => ({
        source,
        label: CashflowSourceLabels[source] || source,
        color: CashflowSourceColors[source] || '#6B7280',
        amount: value.amount,
        count: value.count,
      })),
    [summary.sourceBreakdown],
  );

  const TrendTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const row = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{formatDateForDisplay(new Date(label))}</p>
        <p className="text-emerald-600">Tiền vào: {formatCurrency(row.inflow)}</p>
        <p className="text-rose-600">Tiền ra: {formatCurrency(row.outflow)}</p>
        <p className={`font-semibold ${row.net >= 0 ? 'text-slate-900' : 'text-rose-700'}`}>
          Ròng: {formatCurrency(row.net)}
        </p>
        <p className="text-sm text-gray-500 mt-1">Giao dịch: {row.transactions}</p>
      </div>
    );
  };

  const DistributionTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-xl shadow-lg">
        <p className="font-medium text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-600">Số giao dịch: {item.value}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
        <span className="ml-3 text-lg text-gray-600">Đang tải báo cáo dòng tiền...</span>
      </div>
    );
  }

  if (message) {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg">
        {message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_55%)] pointer-events-none"></div>
        <div className="relative space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Cashflow Report</p>
              <h2 className="text-3xl font-semibold mt-2">Báo cáo dòng tiền tổng hợp</h2>
              <p className="text-slate-300 mt-3 max-w-2xl">
                Theo dõi đồng thời tiền vào từ đơn hàng và bán lại Ancarat, cùng tiền ra cho nhập hàng và mua lại đơn khách.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:min-w-[320px]">
              <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">Tiền vào</p>
                <p className="text-xl font-semibold mt-1">{formatCurrency(summary.totalInflow)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">Tiền ra</p>
                <p className="text-xl font-semibold mt-1">{formatCurrency(summary.totalOutflow)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Bộ lọc thời gian</h3>
                <p className="text-sm text-slate-300 mt-1">Chọn khoảng thời gian để cập nhật toàn bộ báo cáo dòng tiền.</p>
              </div>

              {dateRange && (
                <div className="text-sm text-slate-200">
                  {formatDateForDisplay(dateRange.startDate)} - {formatDateForDisplay(dateRange.endDate)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Khoảng thời gian
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-slate-950/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {timePeriodOptions.map((option) => (
                    <option key={option.key} value={option.key} className="text-gray-900">
                      {option.label}
                    </option>
                  ))}
                  <option value="month" className="text-gray-900">Theo tháng</option>
                </select>
              </div>

              {selectedPeriod === 'month' && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Chọn tháng
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-slate-950/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="" className="text-gray-900">Chọn tháng...</option>
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value} className="text-gray-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedPeriod === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full rounded-2xl border border-white/15 bg-slate-950/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate}
                      className="w-full rounded-2xl border border-white/15 bg-slate-950/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [color-scheme:dark]"
                    />
                  </div>
                </>
              )}
            </div>

            {invalidCustomRange && (
              <div className="mt-4 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                Ngày bắt đầu không thể sau ngày kết thúc.
              </div>
            )}
          </div>
        </div>
      </div>

      {!dateRange ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Vui lòng chọn khoảng thời gian hợp lệ
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Chọn tháng hoặc nhập khoảng ngày hợp lệ để xem báo cáo.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {summaryCardConfigs.map((card) => (
              <div
                key={card.key}
                className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-white shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/80">{card.label}</p>
                    <p className={`text-3xl font-semibold mt-2 ${card.valueClassName}`}>
                      {formatSummaryValue(card.key, summary[card.key])}
                    </p>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center text-xl font-semibold">
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {sourceCards.map((card) => (
              <div key={card.source} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: card.color }}></div>
                    <p className="font-medium text-gray-900">{card.label}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {card.count} GD
                  </span>
                </div>
                <p className="text-2xl font-semibold text-gray-900 mt-4">{formatCurrency(card.amount)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {card.source === CashflowSource.ORDER || card.source === CashflowSource.IMPORT_ORDER_RESALE
                    ? 'Đóng góp vào tiền vào'
                    : 'Đóng góp vào tiền ra'}
                </p>
              </div>
            ))}
          </div>

          {transactions.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-700">
                ≈
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-4">Không có giao dịch thu/chi trong khoảng thời gian này</h3>
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                Báo cáo này tổng hợp 4 luồng: đơn hàng, đơn nhập, mua lại đơn khách và bán lại Ancarat. Hãy thử đổi khoảng thời gian để xem biến động dòng tiền.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-6">
                <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Dòng tiền theo ngày</h3>
                      <p className="text-sm text-gray-500 mt-1">So sánh tiền vào, tiền ra và số ròng trong cùng một trục thời gian.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500"></span>Tiền vào</div>
                      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-rose-500"></span>Tiền ra</div>
                      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-800"></span>Ròng</div>
                    </div>
                  </div>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="date"
                          stroke="#6B7280"
                          fontSize={12}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                          }}
                        />
                        <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => formatNumber(value)} />
                        <Tooltip content={<TrendTooltip />} />
                        <Bar dataKey="inflow" fill="#10B981" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="outflow" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                        <Line type="monotone" dataKey="net" stroke="#0F172A" strokeWidth={3} dot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-5">Tỷ trọng nguồn giao dịch</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sourceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {sourceData.map((entry) => (
                              <Cell key={entry.source} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<DistributionTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-3">
                      {sourceData.map((item) => (
                        <div key={item.source} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-5">Trạng thái giao dịch</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {statusData.map((item) => (
                        <div key={`${item.source}-${item.status}`} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                            <span className="text-gray-700 truncate">{item.name}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
                    <p className="text-sm text-gray-500 mt-1">Danh sách đã chuẩn hóa để đối chiếu nhanh nguồn thu và nguồn chi.</p>
                  </div>
                  <span className="text-sm text-gray-500">Mới nhất trước</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại giao dịch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chiều tiền</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID đơn</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentTransactions.map((transaction) => (
                        <tr key={`${transaction.source}-${transaction.reference_id}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: CashflowSourceColors[transaction.source] || '#6B7280' }}
                              ></span>
                              <span className="text-sm font-medium text-gray-900">
                                {CashflowSourceLabels[transaction.source] || transaction.source}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {formatDateForDisplay(new Date(transaction.transaction_date))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                transaction.direction === CashflowDirection.INFLOW
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {CashflowDirectionLabels[transaction.direction]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {transaction.display_status}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                              transaction.direction === CashflowDirection.INFLOW ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {transaction.direction === CashflowDirection.INFLOW ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link
                              to={getTransactionDetailPath(transaction)}
                              className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <span>{transaction.reference_id}</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default RevenueReport;
