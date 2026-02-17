<?php

namespace App\Form;

use App\Entity\Categoria;
use App\Entity\Producto;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\File;

class ProductoType extends AbstractType
{
    public function buildForm(FormBuilderInterface $constructor, array $opciones): void
    {
        $constructor
            ->add('nombre', TextType::class, [
                'label' => 'Nombre del producto',
                'attr'  => ['class' => 'form-control'],
            ])
            ->add('descripcion', TextareaType::class, [
                'label'    => 'Descripción',
                'required' => false,
                'attr'     => ['class' => 'form-control', 'rows' => 3],
            ])
            ->add('precio', MoneyType::class, [
                'label'    => 'Precio (€)',
                'currency' => 'EUR',
                'attr'     => ['class' => 'form-control'],
            ])
            ->add('categoria', EntityType::class, [
                'class'        => Categoria::class,
                'choice_label' => 'nombre',
                'label'        => 'Categoría',
                'placeholder'  => 'Selecciona una categoría',
                'attr'         => ['class' => 'form-select'],
            ])
            ->add('archivoFoto', FileType::class, [
                'label'    => 'Foto principal (JPG)',
                'mapped'   => false,
                'required' => false,
                'constraints' => [
                    new File([
                        'maxSize'   => '5M',
                        'mimeTypes' => ['image/jpeg', 'image/png', 'image/webp'],
                        'mimeTypesMessage' => 'Sube una imagen válida (JPG, PNG o WebP)',
                    ]),
                ],
                'attr' => ['class' => 'form-control', 'accept' => 'image/*'],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Producto::class,
        ]);
    }
}
