import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { isApiError } from "../../utils/errorUtils";
import type { Field, Fill } from "../../types";
import { parse } from "date-fns";

type FillFormProps = {
  fields: Field[];
  onSaved: () => void;
  editingFill?: Fill;
  onCancelEdit?: () => void;
};

const createDynamicFillSchema = (selectedFieldType?: Field["datatype"]) => {
  let valueSchema;
  switch (selectedFieldType) {
    case "date":
      valueSchema = z
        .string()
        .min(10, "A data deve estar no formato DD/MM/AAAA e ter 10 caracteres.")
        .max(10, "A data deve estar no formato DD/MM/AAAA e ter 10 caracteres.")
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato de data inválido. Use DD/MM/AAAA.")
        .refine((dateStr) => {
          const [day, month, year] = dateStr.split("/").map(Number);
          const dateObj = new Date(year, month - 1, day);
          return (
            dateObj.getFullYear() === year &&
            dateObj.getMonth() === month - 1 &&
            dateObj.getDate() === day
          );
        }, {
          message: "Data inválida (ex: 30/02/2024 ou data não existente)."
        });
      break;
    case "number":
      valueSchema = z
        .string()
        .min(1, "O valor é obrigatório.")
        .refine((value) => !isNaN(parseFloat(value)), {
          message: "Deve ser um número válido.",
        })
      break;
    case "boolean":
      valueSchema = z.string().optional();
      break;
    default:
      valueSchema = z.string().min(1, "O valor é obrigatório.");
  }

  return z.object({
    fieldId: z.string().min(1, "Selecione um campo."),
    value: valueSchema,
  });
};

export function FillForm({
  fields,
  onSaved,
  editingFill,
  onCancelEdit,
}: FillFormProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(
    editingFill?.fieldId || ""
  );

  const selectedField = useMemo(() => {
    return fields.find((f) => f.id === selectedFieldId);
  }, [fields, selectedFieldId]);

  const dynamicSchema = useMemo(() => {
    return createDynamicFillSchema(
      selectedField?.datatype as Field["datatype"]
    );
  }, [selectedField]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<any>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: editingFill
      ? {
          fieldId: editingFill.fieldId,
          value:
            editingFill.field?.datatype === "date"
              ? parse(editingFill.value, "dd/MM/yyyy", new Date())
              : editingFill.field?.datatype === "boolean"
              ? String(editingFill.value)
              : editingFill.value,
        }
      : {
          fieldId: "",
          value: "",
        },
  });

  const watchedFieldId = watch("fieldId");

  useEffect(() => {
    setSelectedFieldId(watchedFieldId);
    if (!editingFill || watchedFieldId !== editingFill.fieldId) {
      setValue("value", "", { shouldValidate: false });
    }
  }, [watchedFieldId, setValue, editingFill]);

  useEffect(() => {
    const defaultFieldValue =
      editingFill && editingFill.fieldId === selectedFieldId
        ? selectedField?.datatype === "date"
          ? parse(editingFill.value, "dd/MM/yyyy", new Date())
          : selectedField?.datatype === "boolean"
          ? String(editingFill.value)
          : editingFill.value
        : "";

    reset(
      {
        fieldId: selectedFieldId,
        value: defaultFieldValue,
      },
      {}
    );
  }, [dynamicSchema, reset, editingFill, selectedFieldId, selectedField]);

  const onSubmit = async (data: any) => {
    let submissionData = { ...data };

    if (selectedField?.datatype === "boolean") {
      const raw = data.value?.toLowerCase();
      if (raw !== "true" && raw !== "false") {
        toast.error("O valor deve ser 'true' ou 'false'.");
        return;
      }
      submissionData.value = raw;
    } else if (selectedField?.datatype === "number") {
      submissionData.value = data.value;
    } else if (selectedField?.datatype === "date") {
      submissionData.value = String(data.value);
    }

    try {
      if (editingFill) {
        await api.put(`/preenchimentos/${editingFill.id}`, submissionData);
        toast.success("Preenchimento atualizado com sucesso!");
      } else {
        await api.post("/preenchimentos", submissionData);
        toast.success("Preenchimento salvo com sucesso!");
      }
      onSaved();
      if (editingFill && onCancelEdit) {
        onCancelEdit();
      }
    } catch (err: unknown) {
      const msg = isApiError(err)
        ? err.response?.data?.message ?? "Erro desconhecido"
        : editingFill
        ? "Erro ao atualizar preenchimento"
        : "Erro ao salvar preenchimento";
      toast.error(msg);
    }
  };

  const renderValueInput = () => {
    if (!selectedField) {
      return (
        <input
          type="text"
          placeholder="Selecione um campo primeiro"
          className="border p-2 rounded w-full bg-gray-100 dark:bg-zinc-800"
          disabled
        />
      );
    }

    switch (selectedField.datatype) {
      case "date":
        return (
          <input
            {...register("value")}
            type="text"
            placeholder="dd/MM/yyyy"
            className="border p-2 rounded w-full"
            disabled={isSubmitting}
          />
        );
      case "number":
        return (
          <input
            {...register("value")}
            placeholder="Valor numérico"
            className="border p-2 rounded w-full"
            disabled={isSubmitting}
          />
        );
      case "boolean":
        return (
          <input
            {...register("value")}
            placeholder="Digite 'true' ou 'false'"
            className="border p-2 rounded w-full"
            disabled={isSubmitting}
          />
        );
      default:
        return (
          <input
            {...register("value")}
            type="text"
            placeholder="Valor"
            className="border p-2 rounded w-full"
            disabled={isSubmitting}
          />
        );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      <div>
        <select
          {...register("fieldId")}
          className="border p-2 rounded w-full dark:bg-zinc-800"
          disabled={isSubmitting || !!editingFill}
        >
          <option value="" disabled>
            Selecione um campo
          </option>
          {fields.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.datatype})
            </option>
          ))}
        </select>
        {errors.fieldId && (
          <p className="text-red-600 text-sm mt-1">
            {(errors.fieldId as any).message}
          </p>
        )}
      </div>

      <div>
        {renderValueInput()}
        {errors.value && selectedField?.datatype !== "boolean" && (
          <p className="text-red-600 text-sm mt-1">
            {(errors.value as any).message}
          </p>
        )}
      </div>

      <div className="md:col-span-1 flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-2">
        <button
          type="submit"
          className="bg-zinc-900 text-white p-2 rounded w-full disabled:opacity-50"
          disabled={isSubmitting || !selectedFieldId}
        >
          {isSubmitting
            ? editingFill
              ? "Atualizando…"
              : "Salvando…"
            : editingFill
            ? "Atualizar"
            : "Salvar Preenchimento"}
        </button>
        {editingFill && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="border p-2 rounded w-full"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
