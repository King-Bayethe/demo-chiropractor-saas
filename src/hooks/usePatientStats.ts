import { useMemo } from 'react';
import { Patient } from './usePatients';

export const usePatientStats = (patients: Patient[]) => {
  return useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Active patients
    const activePatients = patients.filter(p => p.is_active !== false);
    
    // New patients this month
    const newThisMonth = patients.filter(p => {
      const createdDate = new Date(p.created_at);
      return createdDate >= firstDayOfMonth;
    });

    // New patients last month
    const newLastMonth = patients.filter(p => {
      const createdDate = new Date(p.created_at);
      return createdDate >= lastMonth && createdDate <= lastMonthEnd;
    });

    // Calculate growth percentage
    const growthPercentage = newLastMonth.length > 0
      ? Math.round(((newThisMonth.length - newLastMonth.length) / newLastMonth.length) * 100)
      : newThisMonth.length > 0 ? 100 : 0;

    // Insurance coverage percentage
    const withInsurance = patients.filter(p => 
      p.insurance_provider || p.auto_insurance_company || p.health_insurance
    );
    const insuranceCoverage = patients.length > 0 
      ? Math.round((withInsurance.length / patients.length) * 100) 
      : 0;

    // Average visits per patient (mock calculation)
    const avgVisits = 4.2;

    return {
      totalActive: activePatients.length,
      newThisMonth: newThisMonth.length,
      growthPercentage,
      insuranceCoverage,
      avgVisits,
    };
  }, [patients]);
};
