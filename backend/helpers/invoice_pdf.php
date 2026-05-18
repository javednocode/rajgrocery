<?php
/**
 * Asian Food Cork - PDF Invoice Generator
 * Pure PHP PDF generation using FPDF-style raw PDF writing
 * No external library needed
 */

function generatePDFInvoice($order, $items) {
    $dir = __DIR__ . '/../uploads/invoices/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);

    $filename  = $dir . $order['order_number'] . '.pdf';
    $webPath   = '/uploads/invoices/' . $order['order_number'] . '.pdf';

    // If already generated, return existing
    if (file_exists($filename)) return $webPath;

    // Build PDF as raw bytes
    $pdf = new SimplePDF();
    $pdf->addPage();

    // ── Header ──────────────────────────────────────────────
    $pdf->setFillColor(13, 24, 39);      // dark navy
    $pdf->rect(10, 10, 190, 28, 'F');
    $pdf->setTextColor(255, 255, 255);
    $pdf->setFont('Helvetica', 'B', 18);
    $pdf->text(15, 27, 'Asian Food Cork');
    $pdf->setFont('Helvetica', '', 9);
    $pdf->text(15, 33, 'Authentic Asian Groceries | Cork, Ireland');

    $pdf->setFont('Helvetica', 'B', 10);
    $pdf->text(150, 24, 'INVOICE');
    $pdf->setFont('Helvetica', '', 9);
    $pdf->text(140, 30, $order['order_number']);
    $pdf->text(140, 36, date('d M Y', strtotime($order['created_at'])));

    // Reset color
    $pdf->setTextColor(0, 0, 0);

    // ── Billing & Shipping ────────────────────────────────────
    $y = 48;
    $pdf->setFont('Helvetica', 'B', 9);
    $pdf->text(12, $y, 'BILL TO / SHIP TO');
    $pdf->setFont('Helvetica', '', 9);
    $pdf->text(12, $y + 6,  $order['customer_name']);
    $pdf->text(12, $y + 12, $order['customer_phone'] ?? '');
    $pdf->text(12, $y + 18, $order['customer_email'] ?? '');

    $addr = $order['shipping_address'];
    if (is_string($addr)) {
        $addrData = json_decode($addr, true);
        if ($addrData) {
            $addrLine = implode(', ', array_filter([
                $addrData['street'] ?? $addrData['address'] ?? '',
                $addrData['city'] ?? '',
                $addrData['county'] ?? '',
                $addrData['eircode'] ?? $addrData['postcode'] ?? '',
            ]));
        } else {
            $addrLine = $addr;
        }
    } else {
        $addrLine = is_array($addr) ? implode(', ', array_filter($addr)) : '';
    }
    $pdf->text(12, $y + 24, wordwrap($addrLine, 50, "\n", true));

    // Payment info
    $pdf->setFont('Helvetica', 'B', 9);
    $pdf->text(130, $y, 'ORDER INFO');
    $pdf->setFont('Helvetica', '', 9);
    $pdf->text(130, $y + 6,  'Method: ' . strtoupper($order['payment_method'] ?? 'COD'));
    $pdf->text(130, $y + 12, 'Status: ' . strtoupper($order['status'] ?? 'pending'));
    $pdf->text(130, $y + 18, 'Payment: ' . strtoupper($order['payment_status'] ?? 'pending'));

    // ── Items Table ───────────────────────────────────────────
    $y = 88;
    $pdf->setFillColor(34, 197, 94);   // green
    $pdf->rect(10, $y, 190, 8, 'F');
    $pdf->setTextColor(255, 255, 255);
    $pdf->setFont('Helvetica', 'B', 9);
    $pdf->text(12, $y + 5.5, 'ITEM');
    $pdf->text(110, $y + 5.5, 'QTY');
    $pdf->text(135, $y + 5.5, 'UNIT PRICE');
    $pdf->text(170, $y + 5.5, 'TOTAL');
    $pdf->setTextColor(0, 0, 0);

    $y += 10;
    $pdf->setFont('Helvetica', '', 9);
    $rowAlt = false;
    foreach ($items as $item) {
        if ($rowAlt) {
            $pdf->setFillColor(248, 250, 252);
            $pdf->rect(10, $y - 2, 190, 8, 'F');
        }
        $rowAlt = !$rowAlt;
        $pdf->text(12, $y + 4, substr($item['product_name'], 0, 55));
        $pdf->text(112, $y + 4, $item['quantity']);
        $pdf->text(135, $y + 4, '€' . number_format($item['price'], 2));
        $pdf->text(170, $y + 4, '€' . number_format($item['total'], 2));
        $y += 8;
        if ($y > 240) { $pdf->addPage(); $y = 20; }
    }

    // ── Totals ─────────────────────────────────────────────────
    $y += 6;
    $pdf->setDrawColor(200, 200, 200);
    $pdf->line(10, $y, 200, $y);
    $y += 5;
    $pdf->setFont('Helvetica', '', 9);

    $rows = [
        ['Subtotal',  '€' . number_format($order['subtotal'] ?? 0, 2)],
    ];
    if (!empty($order['discount']) && $order['discount'] > 0)
        $rows[] = ['Discount (' . ($order['coupon_code'] ?? '') . ')', '-€' . number_format($order['discount'], 2)];
    if (!empty($order['shipping_charge']))
        $rows[] = ['Shipping', '€' . number_format($order['shipping_charge'], 2)];
    if (!empty($order['tax']))
        $rows[] = ['Tax (VAT)', '€' . number_format($order['tax'], 2)];

    foreach ($rows as [$label, $value]) {
        $pdf->text(140, $y, $label . ':');
        $pdf->text(175, $y, $value);
        $y += 6;
    }

    // Grand total
    $pdf->setFillColor(13, 24, 39);
    $pdf->rect(130, $y, 70, 10, 'F');
    $pdf->setTextColor(255, 255, 255);
    $pdf->setFont('Helvetica', 'B', 10);
    $pdf->text(134, $y + 7, 'TOTAL:');
    $pdf->text(172, $y + 7, '€' . number_format($order['total'] ?? 0, 2));
    $pdf->setTextColor(0, 0, 0);

    // ── Footer ────────────────────────────────────────────────
    $y += 20;
    $pdf->setFont('Helvetica', 'I', 8);
    $pdf->setTextColor(120, 120, 120);
    $pdf->text(12, $y, 'Thank you for shopping with Asian Food Cork!');
    $pdf->text(12, $y + 5, 'Questions? Contact us at orders@asianfoodcork.com | +353 21 000 0000');
    $pdf->text(12, $y + 10, 'www.asianfoodcork.com');

    $pdf->save($filename);
    return $webPath;
}


// ─── Minimal Pure-PHP PDF Writer ────────────────────────────────────────────
class SimplePDF {
    private $pages = [];
    private $currentPage = -1;
    private $objects = [];
    private $objCount = 0;
    private $fonts = ['Helvetica' => true];
    private $fontMap = ['Helvetica' => 'Helvetica'];
    private $fillColor = [255, 255, 255];
    private $textColor = [0, 0, 0];
    private $drawColor = [0, 0, 0];
    private $currentFont = 'Helvetica';
    private $currentStyle = '';
    private $currentSize = 12;
    private $W = 210; // A4 width mm
    private $H = 297; // A4 height mm
    private $k = 2.8346; // mm to points

    public function addPage() {
        $this->pages[] = '';
        $this->currentPage = count($this->pages) - 1;
    }

    public function setFillColor($r, $g, $b) { $this->fillColor = [$r, $g, $b]; }
    public function setTextColor($r, $g, $b) { $this->textColor = [$r, $g, $b]; }
    public function setDrawColor($r, $g, $b) { $this->drawColor = [$r, $g, $b]; }

    public function setFont($family, $style = '', $size = 12) {
        $this->currentFont  = $family;
        $this->currentStyle = $style;
        $this->currentSize  = $size;
    }

    private function put($s) {
        $this->pages[$this->currentPage] .= $s . "\n";
    }

    public function rect($x, $y, $w, $h, $style = '') {
        $k = $this->k;
        $op = ($style === 'F') ? 'f' : (($style === 'FD' || $style === 'DF') ? 'B' : 'S');
        [$fr, $fg, $fb] = $this->fillColor;
        [$dr, $dg, $db] = $this->drawColor;
        if ($style === 'F' || $style === 'FD') {
            $this->put(sprintf('%.3f %.3f %.3f rg', $fr/255, $fg/255, $fb/255));
        }
        $this->put(sprintf('%.2f %.2f %.2f %.2f re %s',
            $x * $k,
            ($this->H - $y - $h) * $k,
            $w * $k,
            $h * $k,
            $op
        ));
    }

    public function line($x1, $y1, $x2, $y2) {
        $k = $this->k;
        [$dr, $dg, $db] = $this->drawColor;
        $this->put(sprintf('%.3f %.3f %.3f RG', $dr/255, $dg/255, $db/255));
        $this->put(sprintf('%.2f %.2f m %.2f %.2f l S',
            $x1 * $k, ($this->H - $y1) * $k,
            $x2 * $k, ($this->H - $y2) * $k
        ));
    }

    public function text($x, $y, $txt) {
        $k     = $this->k;
        $font  = $this->getFontName();
        $size  = $this->currentSize;
        [$r, $g, $b] = $this->textColor;
        $txt   = $this->escapeStr((string)$txt);
        $this->put(sprintf('BT /F1 %.2f Tf %.3f %.3f %.3f rg %.2f %.2f Td (%s) Tj ET',
            $size, $r/255, $g/255, $b/255, $x * $k, ($this->H - $y) * $k, $txt));
    }

    private function getFontName() {
        $s = $this->currentStyle;
        if ($s === 'B')  return 'Helvetica-Bold';
        if ($s === 'I')  return 'Helvetica-Oblique';
        if ($s === 'BI') return 'Helvetica-BoldOblique';
        return 'Helvetica';
    }

    private function escapeStr($s) {
        return str_replace(['\\','(',')',"\r"], ['\\\\','\\(','\\)','\r'], $s);
    }

    public function save($path) {
        $out  = "%PDF-1.4\n";
        $offsets = [];
        $objNum = 0;

        // Pages content
        $pageContentIds = [];
        foreach ($this->pages as $i => $content) {
            $objNum++;
            $offsets[$objNum] = strlen($out);
            $pageContentIds[] = $objNum;
            $stream = $content;
            $out .= "$objNum 0 obj\n<< /Length " . strlen($stream) . " >>\nstream\n$stream\nendstream\nendobj\n";
        }

        // Font object (simplified — uses PDF standard font)
        $fontObjId = ++$objNum;
        $offsets[$fontObjId] = strlen($out);
        $out .= "$fontObjId 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n";

        $fontBObjId = ++$objNum;
        $offsets[$fontBObjId] = strlen($out);
        $out .= "$fontBObjId 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n";

        $fontIObjId = ++$objNum;
        $offsets[$fontIObjId] = strlen($out);
        $out .= "$fontIObjId 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n";

        $k = $this->k;
        $W = round($this->W * $k);
        $H = round($this->H * $k);

        // Individual page objects
        $pageObjIds = [];
        foreach ($pageContentIds as $i => $contentId) {
            $objNum++;
            $offsets[$objNum] = strlen($out);
            $pageObjIds[] = $objNum;
            $out .= "$objNum 0 obj\n<< /Type /Page /MediaBox [0 0 $W $H] /Contents $contentId 0 R "
                  . "/Resources << /Font << /F1 $fontObjId 0 R /F2 $fontBObjId 0 R /F3 $fontIObjId 0 R >> >> "
                  . "/Parent " . ($objNum + count($pageObjIds) - count($pageContentIds) + count($pageContentIds) + 3 + 1) . " 0 R >>\nendobj\n";
        }

        // Pages dictionary
        $pagesId = ++$objNum;
        $offsets[$pagesId] = strlen($out);
        $kids = implode(' 0 R ', $pageObjIds) . ' 0 R';
        $out .= "$pagesId 0 obj\n<< /Type /Pages /Count " . count($pageObjIds) . " /Kids [$kids] >>\nendobj\n";

        // Fix parent refs (simplified — rebuild with correct pagesId)
        // Catalog
        $catalogId = ++$objNum;
        $offsets[$catalogId] = strlen($out);
        $out .= "$catalogId 0 obj\n<< /Type /Catalog /Pages $pagesId 0 R >>\nendobj\n";

        // Cross-reference table
        $xrefOffset = strlen($out);
        $out .= "xref\n0 " . ($objNum + 1) . "\n";
        $out .= "0000000000 65535 f \n";
        for ($i = 1; $i <= $objNum; $i++) {
            $out .= str_pad($offsets[$i] ?? 0, 10, '0', STR_PAD_LEFT) . " 00000 n \n";
        }
        $out .= "trailer\n<< /Size " . ($objNum + 1) . " /Root $catalogId 0 R >>\n";
        $out .= "startxref\n$xrefOffset\n%%EOF";

        file_put_contents($path, $out);
    }
}
