<?php

namespace App\Service;

use App\Entity\Pedido;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

/**
 * Servicio de envío de emails transaccionales.
 * Genera HTML inline y envía con Symfony Mailer.
 */
class ServicioEmail
{
    public function __construct(
        private MailerInterface $mailer,
    ) {}

    /**
     * Envía email de confirmación de pedido al cliente.
     */
    public function enviarConfirmacionPedido(Pedido $pedido): void
    {
        $usuario = $pedido->getUsuario();

        $detallesHtml = '';
        foreach ($pedido->getDetalles() as $detalle) {
            $nombre   = htmlspecialchars($detalle->getProducto()->getNombre());
            $cantidad = $detalle->getCantidad();
            $subtotal = bcmul($detalle->getPrecioUnitario(), (string) $cantidad, 2);
            $detallesHtml .= <<<ROW
            <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:12px 0;font-size:13px;text-transform:uppercase;letter-spacing:.5px;">{$nombre}</td>
                <td align="center" style="padding:12px 0;font-size:13px;color:#666;">×{$cantidad}</td>
                <td align="right" style="padding:12px 0;font-size:13px;">{$subtotal} €</td>
            </tr>
            ROW;
        }

        $envioGratis  = (float) $pedido->getTotal() >= 50.00;
        $envioColor   = $envioGratis ? '#2e7d32' : '#1a1a1a';
        $envioTexto   = $envioGratis ? 'GRATIS' : '4.95 €';
        $nombreUsr    = htmlspecialchars($usuario->getNombre());
        $numPedido    = htmlspecialchars($pedido->getNumeroPedido());
        $fecha        = $pedido->getFecha()->format('d/m/Y H:i');
        $total        = $pedido->getTotal();
        $shNombre     = htmlspecialchars($pedido->getShippingNombre());
        $shDir        = htmlspecialchars($pedido->getShippingDireccion());
        $shCiudad     = htmlspecialchars($pedido->getShippingCiudad());
        $shCp         = htmlspecialchars($pedido->getShippingCp());
        $shPais       = htmlspecialchars($pedido->getShippingPais());
        $shTel        = $pedido->getShippingTelefono() ? '<br>Tel: ' . htmlspecialchars($pedido->getShippingTelefono()) : '';

        $html = <<<HTML
        <!DOCTYPE html>
        <html lang="es"><head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f7f7f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a1a;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:40px 20px;">
        <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">

        <tr><td align="center" style="padding:40px 40px 30px;border-bottom:1px solid #e0e0e0;">
            <h1 style="font-family:Georgia,serif;font-size:36px;font-weight:400;letter-spacing:8px;margin:0;">ZARA</h1>
        </td></tr>

        <tr><td align="center" style="padding:40px 40px 20px;">
            <div style="width:50px;height:50px;border-radius:50%;background:#f0fdf4;border:2px solid #bbf7d0;text-align:center;line-height:50px;font-size:24px;color:#2e7d32;margin:0 auto 20px;">✓</div>
            <h2 style="font-size:16px;font-weight:400;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Pedido confirmado</h2>
            <p style="font-size:13px;color:#888;margin:0;">Gracias por tu compra, {$nombreUsr}.</p>
        </td></tr>

        <tr><td align="center" style="padding:10px 40px 30px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:16px 30px;">
            <tr><td align="center">
                <span style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#888;">Nº Pedido</span><br>
                <span style="font-size:22px;font-weight:600;letter-spacing:1px;">{$numPedido}</span>
            </td></tr></table>
            <p style="font-size:12px;color:#888;margin:10px 0 0;">{$fecha}</p>
        </td></tr>

        <tr><td style="padding:0 40px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e0e0e0;">
            <tr>
                <td style="padding:16px 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#888;">Producto</td>
                <td align="center" style="padding:16px 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#888;">Ud.</td>
                <td align="right" style="padding:16px 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#888;">Precio</td>
            </tr>
            {$detallesHtml}
            </table>
        </td></tr>

        <tr><td style="padding:0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e0e0e0;">
            <tr>
                <td style="padding:12px 0;font-size:13px;color:#666;">Envío</td>
                <td align="right" style="padding:12px 0;font-size:13px;color:{$envioColor};">{$envioTexto}</td>
            </tr></table>
        </td></tr>

        <tr><td style="padding:0 40px 30px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1a1a1a;">
            <tr>
                <td style="padding:16px 0;font-size:14px;font-weight:500;text-transform:uppercase;letter-spacing:2px;">Total</td>
                <td align="right" style="padding:16px 0;font-size:16px;font-weight:600;">{$total} €</td>
            </tr></table>
        </td></tr>

        <tr><td style="padding:0 40px 30px;">
            <div style="background:#f7f7f7;padding:20px;">
                <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#888;margin:0 0 10px;">Dirección de envío</p>
                <p style="font-size:13px;line-height:1.6;margin:0;">
                    {$shNombre}<br>{$shDir}<br>{$shCp} {$shCiudad}<br>{$shPais}{$shTel}
                </p>
            </div>
        </td></tr>

        <tr><td align="center" style="padding:30px 40px;border-top:1px solid #e0e0e0;background:#fafafa;">
            <p style="font-size:11px;color:#888;margin:0 0 5px;letter-spacing:1px;">ZARA — Proyecto académico</p>
            <p style="font-size:11px;color:#aaa;margin:0;">Este email se ha generado automáticamente.</p>
        </td></tr>

        </table></td></tr></table>
        </body></html>
        HTML;

        $email = (new Email())
            ->from(new Address('tienda@zara.dev', 'ZARA Tienda'))
            ->to(new Address($usuario->getEmail(), $usuario->getNombre()))
            ->subject('Tu pedido ' . $pedido->getNumeroPedido() . ' ha sido confirmado')
            ->html($html);

        $this->mailer->send($email);
    }
}
