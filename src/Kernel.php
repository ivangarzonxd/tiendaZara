<?php

namespace App;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as KernelBase;

class Kernel extends KernelBase
{
    use MicroKernelTrait;
}
