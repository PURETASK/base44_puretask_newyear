import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AnalyticsExportButton({ entityName, filters = {}, filename = 'export.csv' }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      let data;
      if (entityName === 'PlatformAnalyticsDaily') {
        data = await base44.entities.PlatformAnalyticsDaily.list('-created_date', 365);
      } else if (entityName === 'CleanerDailySnapshot') {
        data = await base44.entities.CleanerDailySnapshot.list('-created_date', 1000);
      } else {
        data = await base44.entities[entityName].list();
      }
      
      if (data.length === 0) {
        alert('No data to export');
        setExporting(false);
        return;
      }
      
      // Convert to CSV
      const headers = Object.keys(data[0]).filter(key => 
        !['id', 'created_by', 'created_date', 'updated_date'].includes(key)
      );
      
      let csv = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = headers.map(header => {
          let val = row[header];
          if (typeof val === 'object') val = JSON.stringify(val);
          if (typeof val === 'string') val = val.replace(/"/g, '""');
          return `"${val}"`;
        });
        csv += values.join(',') + '\n';
      });
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setExporting(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed');
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      variant="outline"
      className="font-fredoka"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </>
      )}
    </Button>
  );
}