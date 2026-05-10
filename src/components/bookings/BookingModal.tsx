// import { useState } from 'react'
// import { Upload, CheckCircle2 } from 'lucide-react'
// import type { Court } from '../../types'
// import { Modal } from '../ui/Modal'
// import { Button } from '../ui/Button'
// import { Select } from '../ui/Input'
// import { TIME_SLOTS } from '../../data/mock'

// interface BookingModalProps {
//   court: Court | null
//   onClose: () => void
//   onConfirm: (data: BookingFormData) => void
// }

// export interface BookingFormData {
//   court_id: string
//   date: string
//   start_time: string
//   end_time: string
//   payment_proof?: File
//   payment_reference: string
// }

// const today = new Date().toISOString().split('T')[0]

// export function BookingModal({ court, onClose, onConfirm }: BookingModalProps) {
//   const [step, setStep] = useState<1 | 2 | 3>(1)
//   const [date, setDate] = useState(today)
//   const [startSlot, setStartSlot] = useState(TIME_SLOTS[0])
//   const [proofFile, setProofFile] = useState<File | null>(null)
//   const [reference, setReference] = useState('')
//   const [loading, setLoading] = useState(false)

//   const endSlot = TIME_SLOTS[TIME_SLOTS.indexOf(startSlot) + 1] ?? '20:00'

//   function handleConfirm() {
//     if (!court) return
//     setLoading(true)
//     setTimeout(() => {
//       onConfirm({
//         court_id: court.id, date, start_time: startSlot, end_time: endSlot,
//         payment_proof: proofFile ?? undefined, payment_reference: reference,
//       })
//       setLoading(false)
//       setStep(3)
//     }, 800)
//   }

//   return (
//     <Modal open={!!court} onClose={onClose} title="Book a Court">
//       {step === 1 && (
//         <div className="flex flex-col gap-4">
//           <div className="bg-accent-soft border border-accent-mid rounded-lg p-3">
//             <p className="text-sm font-medium text-text-1">{court?.name}</p>
//             <p className="text-xs text-text-2">{court?.description}</p>
//           </div>

//           <Select label="Date" value={date} onChange={e => setDate(e.target.value)}>
//             {/* For demo, just show today + 7 days */}
//             {Array.from({ length: 7 }, (_, i) => {
//               const d = new Date(); d.setDate(d.getDate() + i)
//               const val = d.toISOString().split('T')[0]
//               return <option key={val} value={val}>{val}</option>
//             })}
//           </Select>

//           <Select label="Time Slot" value={startSlot} onChange={e => setStartSlot(e.target.value)}>
//             {TIME_SLOTS.slice(0, -1).map(slot => (
//               <option key={slot} value={slot}>{slot} – {TIME_SLOTS[TIME_SLOTS.indexOf(slot) + 1]}</option>
//             ))}
//           </Select>

//           <div className="bg-bg-surface2 rounded-lg p-3 text-xs text-text-2 leading-relaxed">
//             <span className="font-medium text-text-1">Summary: </span>
//             {court?.name} · {date} · {startSlot}–{endSlot}
//           </div>

//           <Button onClick={() => setStep(2)} className="w-full">Next — Upload Payment</Button>
//         </div>
//       )}

//       {step === 2 && (
//         <div className="flex flex-col gap-4">
//           <p className="text-xs text-text-2">Upload your GCash / Maya / Bank transfer screenshot.</p>

//           <label className="border-2 border-dashed border-border-strong rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-accent hover:bg-accent-soft/40 transition-colors">
//             <input type="file" accept="image/*" className="hidden"
//               onChange={e => setProofFile(e.target.files?.[0] ?? null)} />
//             {proofFile ? (
//               <>
//                 <CheckCircle2 className="w-8 h-8 text-status-success" />
//                 <p className="text-sm font-medium text-text-1">{proofFile.name}</p>
//                 <p className="text-xs text-text-2">Tap to change</p>
//               </>
//             ) : (
//               <>
//                 <Upload className="w-8 h-8 text-text-3" />
//                 <p className="text-sm text-text-2">Click to upload payment proof</p>
//                 <p className="text-xs text-text-3">PNG, JPG up to 5MB</p>
//               </>
//             )}
//           </label>

//           <div className="flex flex-col gap-1.5">
//             <label className="text-xs font-medium text-text-2">Reference Number</label>
//             <input className="input" placeholder="e.g. GCash #12345"
//               value={reference} onChange={e => setReference(e.target.value)} />
//           </div>

//           <div className="flex gap-2">
//             <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
//             <Button onClick={handleConfirm} loading={loading}
//               disabled={!reference} className="flex-1">
//               Submit Booking
//             </Button>
//           </div>
//         </div>
//       )}

//       {step === 3 && (
//         <div className="flex flex-col items-center gap-4 py-4 text-center">
//           <div className="w-14 h-14 rounded-full bg-status-successBg flex items-center justify-center">
//             <CheckCircle2 className="w-8 h-8 text-status-success" />
//           </div>
//           <div>
//             <p className="font-medium text-text-1">Booking Submitted!</p>
//             <p className="text-xs text-text-2 mt-1">We'll notify you once the admin verifies your payment.</p>
//           </div>
//           <Button variant="secondary" onClick={onClose} className="w-full">Close</Button>
//         </div>
//       )}
//     </Modal>
//   )
// }
