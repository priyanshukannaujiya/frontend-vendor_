import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function ComplianceAnalyticsPage({ vendors, sdsDocuments, requestsSent, complianceRate }) {
  const sentVsReceivedRef = useRef(null);
  const complianceStatusRef = useRef(null);
  const monthlyRateRef = useRef(null);

  const charts = useRef({
    sentVsReceived: null,
    complianceStatus: null,
    monthlyRate: null
  });

  const totalVendors = vendors.length;
  const compliantCount = vendors.filter(v => v.complianceStatus === 'Compliant').length;
  const underReviewCount = vendors.filter(v => v.complianceStatus === 'Under Review').length;
  const pendingCount = vendors.filter(v => v.complianceStatus === 'Pending').length;
  const nonCompliantCount = vendors.filter(v => v.complianceStatus === 'Non-Compliant' || v.complianceStatus === 'Overdue').length;

  useEffect(() => {
    // ----------------------------------------------------
    // Chart 1: Requests Dispatched vs. SDS Received
    // ----------------------------------------------------
    if (sentVsReceivedRef.current) {
      if (charts.current.sentVsReceived) charts.current.sentVsReceived.destroy();

      const ctx = sentVsReceivedRef.current.getContext('2d');
      charts.current.sentVsReceived = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Current Batch'],
          datasets: [
            {
              label: 'Compliance Requests Sent',
              data: [requestsSent || 0],
              backgroundColor: '#0D47A1', // Dow Dark Blue
              borderRadius: 6,
              barPercentage: 0.6,
            },
            {
              label: 'SDS Documents Received',
              data: [sdsDocuments.length || 0],
              backgroundColor: '#1976D2', // Dow Light Blue
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
                font: { family: 'Helvetica Neue, Arial', weight: '600', size: 12 }
              }
            }
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { stepSize: 2 } }
          }
        }
      });
    }

    // ----------------------------------------------------
    // Chart 2: Compliance Breakdown (Doughnut)
    // ----------------------------------------------------
    if (complianceStatusRef.current) {
      if (charts.current.complianceStatus) charts.current.complianceStatus.destroy();

      const ctx = complianceStatusRef.current.getContext('2d');
      charts.current.complianceStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Compliant', 'Under Review', 'Pending Request', 'Non-Compliant'],
          datasets: [{
            data: [
              compliantCount || 0,
              underReviewCount || 0,
              pendingCount || 0,
              nonCompliantCount || 0
            ],
            backgroundColor: ['#2e7d32', '#1565c0', '#f9a825', '#c62828'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 16,
                font: { family: 'Helvetica Neue, Arial', weight: '600', size: 12 }
              }
            }
          }
        }
      });
    }

    // ----------------------------------------------------
    // Chart 3: Compliance Rate Trend (Line)
    // ----------------------------------------------------
    if (monthlyRateRef.current) {
      if (charts.current.monthlyRate) charts.current.monthlyRate.destroy();

      const ctx = monthlyRateRef.current.getContext('2d');
      charts.current.monthlyRate = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Current'],
          datasets: [{
            label: 'Dow Global Compliance Rate (%)',
            data: [0, 0, 0, 0, 0, complianceRate || 0],
            fill: true,
            borderColor: '#0D47A1',
            backgroundColor: 'rgba(13, 71, 161, 0.08)',
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#0D47A1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { display: false } },
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

    return () => {
      if (charts.current.sentVsReceived) charts.current.sentVsReceived.destroy();
      if (charts.current.complianceStatus) charts.current.complianceStatus.destroy();
      if (charts.current.monthlyRate) charts.current.monthlyRate.destroy();
    };
  }, [compliantCount, underReviewCount, pendingCount, nonCompliantCount, requestsSent, sdsDocuments.length, complianceRate]);

  return (
    <div className="page-content">
      <div className="charts-grid">
        {/* Chart 1: Sent vs. Received */}
        <div className="chart-card wide-chart">
          <div className="card-header">
            <h2>Campaign Requests vs. Documents Received</h2>
            <span className="card-subtitle">Comparison of automated follow-ups dispatched vs Safety Data Sheet (SDS) PDF response rate.</span>
          </div>
          <div className="chart-canvas-container">
            <canvas ref={sentVsReceivedRef}></canvas>
          </div>
        </div>

        {/* Chart 2: Compliance Breakdown */}
        <div className="chart-card">
          <div className="card-header">
            <h2>Supplier Compliance Status</h2>
            <span className="card-subtitle">Distribution of vendors based on document validation outcome and safety checks.</span>
          </div>
          <div className="chart-canvas-container">
            <canvas ref={complianceStatusRef}></canvas>
          </div>
        </div>

        {/* Chart 3: Trend */}
        <div className="chart-card">
          <div className="card-header">
            <h2>Dow Compliance Trend Over Time</h2>
            <span className="card-subtitle">Historical monitoring of supplier compliance rate showing positive growth.</span>
          </div>
          <div className="chart-canvas-container">
            <canvas ref={monthlyRateRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
