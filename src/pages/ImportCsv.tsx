import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { Upload, CheckCircle2, XCircle, Loader2, FileText } from 'lucide-react'
import Layout from '../components/Layout'
import { getAccounts } from '../api/accounts'
import { uploadImport, getImportJob } from '../api/imports'
import type { Account } from '../types/account'
import type { ImportJob } from '../types/import'

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls']

export default function ImportCsv() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [job, setJob] = useState<ImportJob | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getAccounts().then((accs) => {
      setAccounts(accs)
      if (accs.length > 0) setSelectedAccount(accs[0].id)
    })
  }, [])

  useEffect(() => {
    if (!job || job.status === 'done' || job.status === 'failed') return

    const interval = setInterval(async () => {
      const updated = await getImportJob(job.id)
      setJob(updated)
    }, 1000)

    return () => clearInterval(interval)
  }, [job])

  function isValidFile(candidate: File): boolean {
    const name = candidate.name.toLowerCase()
    return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))
  }

  function selectFile(candidate: File) {
    if (!isValidFile(candidate)) {
      setError('Formato no soportado. Usa un archivo .csv o .xlsx')
      return
    }
    setError('')
    setFile(candidate)
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) selectFile(selected)
  }

  function handleDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) selectFile(dropped)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file || !selectedAccount) return

    setError('')
    setUploading(true)
    setJob(null)

    try {
      const newJob = await uploadImport(file, selectedAccount)
      setJob(newJob)
    } catch {
      setError('No se pudo subir el archivo. Verifica el formato.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Layout>
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Importar transacciones</h2>

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cuenta
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-700"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Archivo
            </label>

            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 cursor-pointer transition-colors ${
                isDragging
                  ? 'border-slate-500 bg-slate-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <>
                  <FileText size={24} className="text-slate-500" />
                  <span className="text-sm text-slate-700 font-medium">{file.name}</span>
                  <span className="text-xs text-slate-400">Haz clic o arrastra para cambiar</span>
                </>
              ) : (
                <>
                  <Upload size={24} className="text-slate-400" />
                  <span className="text-sm text-slate-600">
                    Arrastra tu archivo aquí, o haz clic para elegirlo
                  </span>
                  <span className="text-xs text-slate-400">Formatos: .csv, .xlsx</span>
                </>
              )}
            </label>

            <p className="text-xs text-slate-400 mt-1">
              Columnas esperadas: Fecha, Descripción, Monto
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={uploading || !file}
            className="flex items-center gap-2 rounded-lg bg-slate-800 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            <Upload size={16} />
            {uploading ? 'Subiendo...' : 'Subir e importar'}
          </button>
        </form>

        {job && <ImportStatus job={job} />}
      </div>
    </Layout>
  )
}

function ImportStatus({ job }: { job: ImportJob }) {
  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-2">
        <StatusIcon status={job.status} />
        <span className="text-sm font-medium text-slate-700">
          {statusLabel(job.status)}
        </span>
      </div>

      {job.total_rows > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{ width: `${(job.processed_rows / job.total_rows) * 100}%` }}
          />
        </div>
      )}

      <p className="text-xs text-slate-500">
        {job.processed_rows} / {job.total_rows || '?'} transacciones procesadas
      </p>

      {job.status === 'failed' && (
        <p className="text-sm text-red-600 mt-2">{job.error_message}</p>
      )}
    </div>
  )
}

function StatusIcon({ status }: { status: ImportJob['status'] }) {
  if (status === 'done') return <CheckCircle2 size={18} className="text-emerald-600" />
  if (status === 'failed') return <XCircle size={18} className="text-red-600" />
  return <Loader2 size={18} className="text-slate-400 animate-spin" />
}

function statusLabel(status: ImportJob['status']) {
  const labels: Record<ImportJob['status'], string> = {
    pending: 'Pendiente...',
    processing: 'Procesando...',
    done: 'Completado',
    failed: 'Falló',
  }
  return labels[status]
}