import { useFields } from '../hooks/useFields';
import { FieldForm } from '../components/common/FieldForm';
import { FieldsTable } from '../components/common/FieldsTable';

export default function FieldsPage() {
  const { fields, loading, error, refresh } = useFields();

  return (
    <div>
      <h1 className="text-2xl mb-4">Gerenciar Campos</h1>

      <FieldForm onSaved={refresh} />

      {loading && <p>Carregando campos…</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && !error && fields.length > 0 && (
        <FieldsTable fields={fields} />
      )}
      {!loading && !error && fields.length === 0 && (
        <p className="text-gray-500">Nenhum campo cadastrado.</p>
      )}
    </div>
  );
}
