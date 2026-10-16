import { FieldOperation } from '../types/fieldbook';

const STORAGE_KEYS = {
  // Field book operations key
  OPERATIONS: 'geaagro_fieldbook_operations_v1',
  
  // Livestock keys
  BUFFALO_ANIMALS: 'geaagro_buffalo_animals_v1',
  
  CAPRINE_HEALTH: 'gea_caprine_health_v1',
  CAPRINE_MILK: 'gea_caprine_milk_logs_v1',
  
  EQUINE_HEALTH: 'geaagro_equine_health',
  EQUINE_FARRIERY: 'geaagro_equine_farriery',
  EQUINE_EXAMS: 'geaagro_equine_exams',
  
  SWINE_BATCHES: 'geaagro_swine_batches_v1',
  SWINE_DIETS: 'geaagro_swine_diets_v1',
};

export function syncLivestockToFieldBook(farmId: string): FieldOperation[] {
  const operations: FieldOperation[] = [];

  try {
    // 1. Sync Caprine Health -> Field Book Vaccination
    const caprineHealthRaw = localStorage.getItem(STORAGE_KEYS.CAPRINE_HEALTH);
    if (caprineHealthRaw) {
      const caprineHealth = JSON.parse(caprineHealthRaw);
      if (Array.isArray(caprineHealth)) {
        caprineHealth.forEach((record: any) => {
          operations.push({
            id: `sync-cap-health-${record.id}`,
            farmId: farmId,
            fieldId: 'fld-3', // Centralized Field / Piquete
            type: 'caprine_vaccination',
            status: 'completed',
            date: record.date || new Date().toISOString().split('T')[0],
            responsible: record.veterinarian || 'Tratador Caprino',
            notes: `${record.type}: ${record.productName || 'Tratamento'}. Diagnóstico/Dose: ${record.dosage || ''}. Próxima dose: ${record.nextApplicationDate || 'N/A'}. Obs: ${record.notes || ''}`,
            details: {
              product: record.productName,
              dose: 1,
              target: record.type,
            },
            createdAt: record.createdAt || new Date().toISOString(),
            updatedAt: record.updatedAt || new Date().toISOString(),
          });
        });
      }
    }

    // 2. Sync Caprine Milk -> Field Book Milk
    const caprineMilkRaw = localStorage.getItem(STORAGE_KEYS.CAPRINE_MILK);
    if (caprineMilkRaw) {
      const caprineMilk = JSON.parse(caprineMilkRaw);
      if (Array.isArray(caprineMilk)) {
        caprineMilk.forEach((record: any) => {
          const totalLiters = (record.morningLiters || 0) + (record.afternoonLiters || 0);
          operations.push({
            id: `sync-cap-milk-${record.id}`,
            farmId: farmId,
            fieldId: 'fld-3',
            type: 'caprine_milk',
            status: 'completed',
            date: record.date || new Date().toISOString().split('T')[0],
            responsible: record.milker || 'Ordenhador Caprinos',
            notes: `Ordenha realizada. Volume Total: ${totalLiters} L. Manhã: ${record.morningLiters} L, Tarde: ${record.afternoonLiters} L. Gordura/CCS: ${record.fatPct || ''}% / ${record.somaticCellCount || ''}`,
            details: {
              crop: 'Caprinocultura - Ordenha',
              variety: 'Saanen / Alpina',
              population: totalLiters,
            },
            createdAt: record.createdAt || new Date().toISOString(),
            updatedAt: record.updatedAt || new Date().toISOString(),
          });
        });
      }
    }

    // 3. Sync Equine Farriery -> Field Book Farriery
    const equineFarrieryRaw = localStorage.getItem(STORAGE_KEYS.EQUINE_FARRIERY);
    if (equineFarrieryRaw) {
      const equineFarriery = JSON.parse(equineFarrieryRaw);
      if (Array.isArray(equineFarriery)) {
        equineFarriery.forEach((record: any) => {
          operations.push({
            id: `sync-equ-farr-${record.id}`,
            farmId: farmId,
            fieldId: 'fld-1',
            type: 'equine_farriery',
            status: 'completed',
            date: record.date || new Date().toISOString().split('T')[0],
            responsible: record.farrierName || 'Ferreador Equino',
            notes: `Casqueamento / Ferrageamento. Tipo de casco: ${record.hoofType || ''}. Tipo de ferradura: ${record.shoeType || ''}. Notas: ${record.notes || ''}`,
            details: {
              crop: 'Equinocultura - Trabalho',
              variety: record.hoofCondition || 'Casco Normal',
            },
            createdAt: record.createdAt || new Date().toISOString(),
            updatedAt: record.updatedAt || new Date().toISOString(),
          });
        });
      }
    }

    // 4. Sync Equine Health & Exams -> Field Book Vaccine
    const equineHealthRaw = localStorage.getItem(STORAGE_KEYS.EQUINE_HEALTH);
    if (equineHealthRaw) {
      const equineHealth = JSON.parse(equineHealthRaw);
      if (Array.isArray(equineHealth)) {
        equineHealth.forEach((record: any) => {
          operations.push({
            id: `sync-equ-health-${record.id}`,
            farmId: farmId,
            fieldId: 'fld-1',
            type: 'equine_vaccination',
            status: 'completed',
            date: record.date || new Date().toISOString().split('T')[0],
            responsible: record.veterinarian || 'Tratador Equinos',
            notes: `Atendimento Veterinário. Diagnóstico: ${record.diagnosis || ''}. Medicamentos aplicados: ${record.treatment || ''}. Notas: ${record.notes || ''}`,
            details: {
              product: record.treatment,
              target: record.diagnosis,
            },
            createdAt: record.createdAt || new Date().toISOString(),
            updatedAt: record.updatedAt || new Date().toISOString(),
          });
        });
      }
    }

  } catch (error) {
    console.error('Error in syncLivestockToFieldBook:', error);
  }

  return operations;
}
