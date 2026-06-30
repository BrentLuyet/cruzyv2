'use client'

import { UseFormRegister, FieldErrors, useFieldArray, Control } from 'react-hook-form'
import { FormValues } from '@/lib/schema'

interface Props {
  register: UseFormRegister<FormValues>
  errors: FieldErrors<FormValues>
  control: Control<FormValues>
}

export default function AuthorizedUsersSection({ register, errors, control }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'authorizedUsers' })

  return (
    <>
      <hr className="section-divider" />

      {/* Add authorized user button */}
      <div className="mb-4">
        {fields.length < 3 && (
          <button
            type="button"
            className="add-user-btn"
            onClick={() => append({ firstName: '', lastName: '', email: '', phone: '' })}
          >
            + Add Authorized User
          </button>
        )}
      </div>

      {/* Authorized user blocks */}
      {fields.map((field, index) => (
        <div key={field.id} className="auth-user-block">
          <div className="flex items-center justify-between mb-3">
            <p className="auth-user-title">Authorized User {index + 1} Information</p>
            <button
              type="button"
              onClick={() => remove(index)}
              style={{ color: '#dc3545', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label>First Name</label>
              <input type="text" {...register(`authorizedUsers.${index}.firstName`)} />
              {errors.authorizedUsers?.[index]?.firstName && (
                <span className="field-error">{errors.authorizedUsers[index]?.firstName?.message}</span>
              )}
            </div>
            <div>
              <label>Last Name</label>
              <input type="text" {...register(`authorizedUsers.${index}.lastName`)} />
            </div>
            <div>
              <label>Email</label>
              <input type="email" {...register(`authorizedUsers.${index}.email`)} />
              {errors.authorizedUsers?.[index]?.email && (
                <span className="field-error">{errors.authorizedUsers[index]?.email?.message}</span>
              )}
            </div>
            <div>
              <label>Phone Number</label>
              <input type="tel" {...register(`authorizedUsers.${index}.phone`)} />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
