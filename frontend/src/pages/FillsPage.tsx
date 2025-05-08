import { useMemo, useCallback } from 'react';
import { useFields } from '../hooks/useFields';
import { useFills } from '../hooks/useFills';
import { FillForm } from '../components/common/FillForm';
import { FieldsAccordion, type AccordionGroup } from '../components/common/FieldsAccordion';

export default function FillsPage() {
  const {
    fields,
    loading: loadingFields,
    error: errorFields,
  } = useFields();
  const {
    fills,
    loading: loadingFills,
    error: errorFills,
    refresh: refreshFills,
  } = useFills();

  const loading = loadingFields || loadingFills;
  const error = errorFields ?? errorFills;

  const groups = useMemo<AccordionGroup[]>(() => {
    return fields.map((fld) => ({
      ...fld,
      fills: fills
        .filter((f) => f.fieldId === fld.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }));
  }, [fields, fills]);

  const handleSaved = useCallback(() => {
    refreshFills();
  }, [refreshFills]);

  return (
    <div>
      <h1 className="text-2xl mb-4">Campos e Preenchimentos</h1>

      <FillForm fields={fields} onSaved={handleSaved} />

      {loading && <p>Carregando dados…</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && !error && <FieldsAccordion groups={groups} />}
    </div>
  );
}
