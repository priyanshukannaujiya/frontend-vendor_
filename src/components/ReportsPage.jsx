import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export default function ReportsPage({ vendors, documents, emailsSent }) {
  const sentVsReceivedRef = useRef(null);
  const pendingVendorsRef = useRef(null);
  const responseRateRef = useRef(null);

  const charts = useRef({
    sentVsReceived: null,
    pendingVendors: null,
    responseRate: null
  });

  // Calculate dynamic stats for charts
  const activeCount = vendors.filter(v => v.status === 'Active').length;
  const pendingCount = vendors.filter(v => v.status === 'Pending').length;

  useEffect(() => {
    // ----------------------------------------------------
    // Chart 1: Emails Sent vs. Documents Received
    // ----------------------------------------------------
    if (sentVsReceivedRef.current) {
      if (charts.current.sentVsReceived) charts.current.sentVsReceived.destroy();

      const ctx = sentVsReceivedRef.current.getContext('2d');
      charts.current.sentVsReceived = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['June 19', 'June 20', 'June 21', 'June 22', 'June 23'],
          datasets: [
            {
              label: 'Emails Dispatched',
              data: [4, 2, 5, 2, emailsSent > 4 ? emailsSent - 2 : 4],
              backgroundColor: '#3b82f6',
              borderRadius: 6,
              barPercentage: 0.6,
            },
            {
              label: 'Invoices Collected',
              data: [3, 2, 4, 1, documents.length],
              backgroundColor: '#10b981',
              borderRadius: 6,
              barPercentage: 0.6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                font: { family: 'Inter', weight: '600', size: 12 }
              }
            },
            tooltip: {
              padding: 10,
              bodyFont: { family: 'Inter' },
              titleFont: { family: 'Inter', weight: '700' }
            }
          },
          scales: {
            x: {
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }
      });
    }

    // ----------------------------------------------------
    // Chart 2: Pending Vendors Breakdown (Donut)
    // ----------------------------------------------------
    if (pendingVendorsRef.current) {
      if (charts.current.pendingVendors) charts.current.pendingVendors.destroy();

      const ctx = pendingVendorsRef.current.getContext('2d');
      charts.current.pendingVendors = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Active (Invoices Filed)', 'Pending Reminders'],
          datasets: [{
            data: [activeCount, pendingCount],
            backgroundColor: ['#10b981', '#f59e0b'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 16,
                font: { family: 'Inter', weight: '600', size: 12 }
              }
            },
            tooltip: {
              padding: 10,
              bodyFont: { family: 'Inter' }
            }
          }
        }
      });
    }

    // ----------------------------------------------------
    // Chart 3: Vendor Response Rate over Time
    // ----------------------------------------------------
    if (responseRateRef.current) {
      if (charts.current.responseRate) charts.current.responseRate.destroy();

      const ctx = responseRateRef.current.getContext('2d');
      charts.current.responseRate = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Collection rate (%)',
            data: [62, 68, 70, 72, 75],
            fill: true,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#8b5cf6'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: 10,
              bodyFont: { family: 'Inter' }
            }
          },
          scales: {
            x: {
              grid: { display: false }
            },
            y: {
              beginAtZero: false,
              min: 50,
              max: 100,
              ticks: {
                callback: function(value) { return value + '%'; }
              }
            }
          }
        }
      });
    }

    // Cleanup charts on unmount
    return () => {
      if (charts.current.sentVsReceived) charts.current.sentVsReceived.destroy();
      if (charts.current.pendingVendors) charts.current.pendingVendors.destroy();
      if (charts.current.responseRate) charts.current.responseRate.destroy();
    };
  }, [activeCount, pendingCount, emailsSent, documents.length]);

  return (
    <div className="page-content">
      <div className="charts-grid">
        {/* Chart 1: Emails Sent vs Documents Received */}
        <div className="chart-card wide-chart">
          <div className="card-header">
            <h2>Emails Sent vs. Documents Received</h2>
            <span className="card-subtitle">Daily tracking comparison of email reminders dispatched vs invoices collected.</span>
          </div>
          <div className="chart-canvas-container">
            <canvas ref={sentVsReceivedRef}></canvas>
          </div>
        </div>

        {/* Chart 2: Pending Vendors */}
        <div className="chart-card">
          <div className="card-header">
            <h2>Pending Vendor Distribution</h2>
            <span className="card-subtitle">Percentage breakdown of active, pending, and unresponsive vendors.</span>
          </div>
          <div className="chart-canvas-container">
            <canvas ref={pendingVendorsRef}></canvas>
          </div>
        </div>

        {/* Chart 3: Vendor Response Rate */}
        <div className="chart-card">
          <div className="card-header">
            <h2>Vendor Invoice Response Rate</h2>
            <span className="card-subtitle">Rate of received invoices relative to automated follow-up iterations.</span>
          </div>
          <div className="chart-canvas-container">
            <canvas ref={responseRateRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
