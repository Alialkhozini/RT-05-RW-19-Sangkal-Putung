import { createServerClient } from '@/lib/supabase';
import { 
  FolderOpen, 
  Download, 
  Calendar, 
  User, 
  FileText, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export const revalidate = 0; // Realtime

export default async function AdminDocumentsPage() {
  const supabase = await createServerClient();

  const { data: documents, error } = await supabase
    .from('generated_documents')
    .select(`
      id,
      file_url,
      verification_code,
      created_at,
      letter_requests (
        request_number,
        applicant_name,
        letter_types (
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-6 text-left font-semibold text-xs text-gray-500">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Arsip Surat Resmi Terbit</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Daftar rekaman seluruh surat pengantar warga yang telah disetujui, ditandatangani, dan diterbitkan.</p>
      </div>

      {/* Grid List Arsip Dokumen */}
      <div className="bg-white rounded-3xl border border-neutral-gray shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-bg border-b border-neutral-gray font-bold text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Nomor Tiket</th>
                <th className="px-6 py-4">Jenis Surat</th>
                <th className="px-6 py-4">Warga Penerima</th>
                <th className="px-6 py-4">Tanggal Terbit</th>
                <th className="px-6 py-4">Kode QR Verifikasi</th>
                <th className="px-6 py-4 text-right">Berkas PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-gray font-semibold text-gray-600">
              {documents && documents.length > 0 ? (
                documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-neutral-bg/50">
                    <td className="px-6 py-4 font-bold text-dark">{doc.letter_requests?.request_number || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" /> {doc.letter_requests?.letter_types?.name || 'Surat Pengantar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-dark flex items-center gap-1.5 mt-2">
                      <User className="w-3.5 h-3.5 text-primary shrink-0" /> {doc.letter_requests?.applicant_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-primary text-[10px] tracking-wider">{doc.verification_code}</td>
                    <td className="px-6 py-4 text-right">
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-neutral-bg hover:bg-neutral-gray text-dark px-3 py-1.5 rounded-lg border border-neutral-gray/80 font-bold active:scale-95 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> Unduh Surat <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-gray-300">File Kosong</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <FolderOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">Belum ada arsip surat terbit.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
