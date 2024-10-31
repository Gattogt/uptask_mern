import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTaskById, updateTaskStatus } from '@/api/TaskAPI';
import { toast } from 'react-toastify';
import { formatDate } from '@/utils/utils';
import { statusTranslations } from '@/locales/es'
import { TaskStatus } from '@/types/index';


export default function TaskModalDetails() {
  const params = useParams()
  const projectId = params.projectId!

  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const taskId = queryParams.get('viewTask')!
  const show = taskId ? true : false

  const queryClient = useQueryClient()



  const { data, isError, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById({ projectId, taskId }),
    enabled: !!taskId,
    retry: false

  })

  const { mutate } = useMutation({
    mutationFn: updateTaskStatus,
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: (data) => {
      toast.success(data)
      navigate(location.pathname, { replace: true })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as TaskStatus
    const data = { projectId, taskId, status }
    mutate(data)
  }



  if (isError) {
    setTimeout(() => { toast.error(error.message, { toastId: 'error' }) }, 2000)
    return <Navigate to={`/projects/${projectId}`} />
  }

  if (data) return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => navigate(location.pathname, { replace: true })}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all p-16">
                  <p className='text-sm text-slate-400'>Agregada el: {formatDate(data.createdAt)} </p>
                  <p className='text-sm text-slate-400'>Última actualización:{formatDate(data.updatedAt)} </p>
                  <DialogTitle
                    as="h3"
                    className="font-black text-4xl text-slate-600 my-5"
                  >{data.name}
                  </DialogTitle>
                  <p className='text-lg text-slate-500 mb-2'>Descripción: {data.description}</p>
                  <div className='my-5 space-y-3'>
                    <label className='font-bold'>Estado Actual:</label>
                    <select
                      className="w-full p-3 bg-white border border-gray-300 "
                      defaultValue={data.status}
                      onChange={handleChange}
                    >
                      {Object.entries(statusTranslations).map(([key, value]) => (
                        <option
                          value={key}
                          key={key}
                        >
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}