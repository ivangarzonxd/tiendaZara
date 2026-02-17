<?php

namespace App\Form;

use App\Entity\Categoria;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CategoriaType extends AbstractType
{
    public function buildForm(FormBuilderInterface $constructor, array $opciones): void
    {
        $constructor
            ->add('nombre', TextType::class, [
                'label' => 'Nombre de la categoría',
                'attr'  => ['class' => 'form-control', 'placeholder' => 'Ej: Camisas'],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Categoria::class,
        ]);
    }
}
