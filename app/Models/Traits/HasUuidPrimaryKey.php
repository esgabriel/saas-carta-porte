<?php

namespace App\Models\Traits;

use Illuminate\Support\Str;

trait HasUuidPrimaryKey
{
    /**
     * Boot the trait: genera UUID automáticamente al crear un nuevo registro.
     */
    protected static function bootHasUuidPrimaryKey(): void
    {
        static::creating(function ($model) {
            if (empty($model->{ $model->getKeyName()})) {
                $model->{ $model->getKeyName()} = (string)Str::uuid();
            }
        });
    }

    /**
     * La clave primaria es string (UUID), no auto-incremental.
     */
    public function initializeHasUuidPrimaryKey(): void
    {
        $this->keyType = 'string';
        $this->incrementing = false;
    }
}
