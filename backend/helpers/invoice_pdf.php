<?php
/**
 * Asian Food Cork - PDF Invoice Generator
 * Pure PHP PDF generation — no external library required
 */

function generatePDFInvoice($order, $items) {
    $dir = __DIR__ . '/../uploads/invoices/';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);

    $filename = $dir . $order['order_number'] . '.pdf';
    $webPath  = '/uploads/invoices/' . $order['order_number'] . '.pdf';

    // Return cached file
    if (file_exists($filename)) return $webPath;

    $pdf = new SimplePDF();
    $pdf->addPage();

    // ── Header bar ──────────────────────────────────────────────────────────
    $pdf->setFillColor(13, 24, 39);
    $pdf->rect(10, 10, 190, 28, 'F');

    // Logo image — resolve to absolute path reliably
    // On Hostinger: invoice_pdf.php is at public_html/helpers/, uploads is at public_html/uploads/
    // So __DIR__/../uploads/branding/ is always correct on both local and Hostinger
    $logoRelative = '/uploads/branding/logo_invoice.jpg';
    $logoPaths = [
        // Most reliable: PHP real file resolution from this file's location
        realpath(__DIR__ . '/..')  . $logoRelative,
        // DOCUMENT_ROOT (works when PHP is called via web)
        rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/') . $logoRelative,
        // Absolute from __DIR__ (symlink-safe)
        __DIR__ . '/..' . $logoRelative,
    ];
    $logoPath = null;
    foreach ($logoPaths as $lp) {
        error_log('[PDF Logo] Trying: ' . $lp . ' exists=' . (file_exists($lp) ? 'YES' : 'NO'));
        if ($lp && file_exists($lp)) { $logoPath = $lp; break; }
    }

    if ($logoPath) {
        $pdf->addJpeg($logoPath, 14, 13, 50, 22);
    } else {
        // Fallback: white text name if logo file not found
        error_log('[PDF Logo] No logo file found, using text fallback');
        $pdf->setTextColor(255, 255, 255);
        $pdf->setFont('Helvetica', 'B', 16);
        $pdf->text(15, 25, 'Asian Food Cork');
        $pdf->setFont('Helvetica', '', 9);
        $pdf->text(15, 33, 'Authentic Asian Groceries | Cork, Ireland');
    }

    // INVOICE label top-right
    $pdf->setTextColor(255, 255, 255);
    $pdf->setFont('Helvetica', 'B', 11);
    $pdf->text(148, 22, 'INVOICE');
    $pdf->setFont('Helvetica', '', 9);
    $pdf->text(143, 29, $order['order_number']);
    $pdf->text(143, 35, date('d M Y', strtotime($order['created_at'] ?? 'now')));

    $pdf->setTextColor(0, 0, 0);

    // ── Customer / Billing info ──────────────────────────────────────────────
    $y = 50;
    $pdf->setFont('Helvetica', 'B', 9);
    $pdf->text(12, $y, 'BILL TO / SHIP TO');
    $pdf->setFont('Helvetica', '', 9);
    $pdf->text(12, $y + 7,  $order['customer_name'] ?? '');
    $pdf->text(12, $y + 13, $order['customer_phone'] ?? '');
    $pdf->text(12, $y + 19, $order['customer_email'] ?? '');

    // Address
    $addr = $order['shipping_address'] ?? '';
    if (is_string($addr)) {
        $addrData = json_decode($addr, true);
        if ($addrData) {
            $addr = implode(', ', array_filter([
                $addrData['address_line1'] ?? $addrData['street'] ?? '',
                $addrData['city'] ?? '',
                $addrData['county'] ?? $addrData['state'] ?? '',
                $addrData['eircode'] ?? $addrData['postcode'] ?? '',
                $addrData['country'] ?? '',
            ]));
        }
    } elseif (is_array($addr)) {
        $addr = implode(', ', array_filter($addr));
    }
    $pdf->text(12, $y + 25, substr((string)$addr, 0, 65));

    // Order info right side
    $pdf->setFont('Helvetica', 'B', 9);
    $pdf->text(130, $y, 'ORDER DETAILS');
    $pdf->setFont('Helvetica', '', 9);
    $pdf->text(130, $y + 7,  'Date:    ' . date('d M Y', strtotime($order['created_at'] ?? 'now')));
    $pdf->text(130, $y + 13, 'Method: ' . strtoupper($order['payment_method'] ?? 'COD'));
    $pdf->text(130, $y + 19, 'Status:  ' . strtoupper($order['status'] ?? 'pending'));

    // ── Items Table Header ───────────────────────────────────────────────────
    $y = 90;
    $pdf->setFillColor(34, 197, 94);
    $pdf->rect(10, $y, 190, 9, 'F');
    $pdf->setTextColor(255, 255, 255);
    $pdf->setFont('Helvetica', 'B', 9);
    $pdf->text(12, $y + 6, 'ITEM');
    $pdf->text(110, $y + 6, 'QTY');
    $pdf->text(135, $y + 6, 'UNIT PRICE');
    $pdf->text(170, $y + 6, 'TOTAL');
    $pdf->setTextColor(0, 0, 0);

    // ── Items Rows ───────────────────────────────────────────────────────────
    $y += 11;
    $pdf->setFont('Helvetica', '', 9);
    $alt = false;
    foreach ($items as $item) {
        if ($alt) {
            $pdf->setFillColor(245, 247, 250);
            $pdf->rect(10, $y - 1, 190, 9, 'F');
        }
        $alt = !$alt;
        $pdf->text(12,  $y + 5, substr((string)($item['product_name'] ?? ''), 0, 55));
        $pdf->text(112, $y + 5, (string)($item['quantity'] ?? 1));
        $pdf->text(135, $y + 5, '€' . number_format((float)($item['price'] ?? 0), 2));
        $pdf->text(170, $y + 5, '€' . number_format((float)($item['total'] ?? 0), 2));
        $y += 9;
        if ($y > 245) { $pdf->addPage(); $y = 20; }
    }

    // ── Totals ───────────────────────────────────────────────────────────────
    $y += 5;
    $pdf->setDrawColor(200, 200, 200);
    $pdf->line(10, $y, 200, $y);
    $y += 6;
    $pdf->setFont('Helvetica', '', 9);

    $totals = [['Subtotal', '€' . number_format((float)($order['subtotal'] ?? 0), 2)]];
    if (!empty($order['discount']) && (float)$order['discount'] > 0)
        $totals[] = ['Discount', '-€' . number_format((float)$order['discount'], 2)];
    if (!empty($order['shipping_charge']))
        $totals[] = ['Shipping', '€' . number_format((float)$order['shipping_charge'], 2)];
    if (!empty($order['tax']))
        $totals[] = ['Tax (VAT)', '€' . number_format((float)$order['tax'], 2)];

    foreach ($totals as [$label, $value]) {
        $pdf->text(140, $y, $label . ':');
        $pdf->text(172, $y, $value);
        $y += 7;
    }

    // Grand total box
    $pdf->setFillColor(13, 24, 39);
    $pdf->rect(130, $y - 1, 70, 11, 'F');
    $pdf->setTextColor(255, 255, 255);
    $pdf->setFont('Helvetica', 'B', 10);
    $pdf->text(134, $y + 7, 'TOTAL:');
    $pdf->text(168, $y + 7, '€' . number_format((float)($order['total'] ?? 0), 2));
    $pdf->setTextColor(0, 0, 0);

    // ── Footer ───────────────────────────────────────────────────────────────
    $y += 22;
    $pdf->setFont('Helvetica', 'I', 8);
    $pdf->setTextColor(130, 130, 130);
    $pdf->text(12, $y,      'Thank you for shopping with Asian Food Cork!');
    $pdf->text(12, $y + 6,  'Questions? orders@asianfoodcork.com | +353 21 000 0000');
    $pdf->text(12, $y + 12, 'www.asianfoodcork.com');

    $pdf->save($filename);
    return $webPath;
}


// ─── Correct Pure-PHP PDF Writer ─────────────────────────────────────────────
class SimplePDF {
    // Page content streams
    private array $pageStreams = [];
    private int   $currentPage = -1;

    // Colors (0–255)
    private array $fillColor = [255, 255, 255];
    private array $textColor = [0,   0,   0  ];
    private array $drawColor = [0,   0,   0  ];

    // Font state
    private string $fontStyle = '';
    private float  $fontSize  = 12;

    // A4 in mm
    private float $W = 210;
    private float $H = 297;
    // 1 mm = 2.8346… points
    private float $k = 2.8346456692913;

    // Images queued for embedding
    private array $images = []; // [['path'=>, 'x'=>, 'y'=>, 'w'=>, 'h'=>, 'page'=>], …]

    // ── Page ─────────────────────────────────────────────────────────────────
    public function addPage(): void {
        $this->pageStreams[] = '';
        $this->currentPage  = count($this->pageStreams) - 1;
    }

    // ── Color setters ─────────────────────────────────────────────────────────
    public function setFillColor(int $r, int $g, int $b): void { $this->fillColor = [$r, $g, $b]; }
    public function setTextColor(int $r, int $g, int $b): void { $this->textColor = [$r, $g, $b]; }
    public function setDrawColor(int $r, int $g, int $b): void { $this->drawColor = [$r, $g, $b]; }

    // ── Font ──────────────────────────────────────────────────────────────────
    public function setFont(string $family, string $style = '', float $size = 12): void {
        $this->fontStyle = strtoupper($style);
        $this->fontSize  = $size;
    }

    // ── Primitives ────────────────────────────────────────────────────────────
    private function put(string $s): void {
        $this->pageStreams[$this->currentPage] .= $s . "\n";
    }

    private function fontRef(): string {
        if ($this->fontStyle === 'B')  return '/F2'; // Helvetica-Bold
        if ($this->fontStyle === 'I')  return '/F3'; // Helvetica-Oblique
        return '/F1';                                 // Helvetica
    }

    public function text(float $xMM, float $yMM, string $txt): void {
        $k   = $this->k;
        [$r, $g, $b] = $this->textColor;
        $enc = $this->escapeStr($txt);
        // Convert mm coords: x stays, y is flipped (PDF origin = bottom-left)
        $xPt = $xMM * $k;
        $yPt = ($this->H - $yMM) * $k;
        $this->put(sprintf(
            'BT %s %.2f Tf %.4f %.4f %.4f rg %.4f %.4f Td (%s) Tj ET',
            $this->fontRef(), $this->fontSize,
            $r/255, $g/255, $b/255,
            $xPt, $yPt,
            $enc
        ));
    }

    public function rect(float $xMM, float $yMM, float $wMM, float $hMM, string $style = 'S'): void {
        $k = $this->k;
        [$fr, $fg, $fb] = $this->fillColor;
        [$dr, $dg, $db] = $this->drawColor;

        $xPt = $xMM * $k;
        $yPt = ($this->H - $yMM - $hMM) * $k;
        $wPt = $wMM * $k;
        $hPt = $hMM * $k;

        if ($style === 'F') {
            $this->put(sprintf('%.4f %.4f %.4f rg', $fr/255, $fg/255, $fb/255));
            $this->put(sprintf('%.4f %.4f %.4f %.4f re f', $xPt, $yPt, $wPt, $hPt));
        } elseif ($style === 'FD' || $style === 'DF') {
            $this->put(sprintf('%.4f %.4f %.4f rg', $fr/255, $fg/255, $fb/255));
            $this->put(sprintf('%.4f %.4f %.4f RG', $dr/255, $dg/255, $db/255));
            $this->put(sprintf('%.4f %.4f %.4f %.4f re B', $xPt, $yPt, $wPt, $hPt));
        } else {
            $this->put(sprintf('%.4f %.4f %.4f RG', $dr/255, $dg/255, $db/255));
            $this->put(sprintf('%.4f %.4f %.4f %.4f re S', $xPt, $yPt, $wPt, $hPt));
        }
    }

    public function line(float $x1MM, float $y1MM, float $x2MM, float $y2MM): void {
        $k = $this->k;
        [$dr, $dg, $db] = $this->drawColor;
        $this->put(sprintf('%.4f %.4f %.4f RG', $dr/255, $dg/255, $db/255));
        $this->put(sprintf('%.4f %.4f m %.4f %.4f l S',
            $x1MM * $k, ($this->H - $y1MM) * $k,
            $x2MM * $k, ($this->H - $y2MM) * $k
        ));
    }

    private function escapeStr(string $s): string {
        // Encode latin-1 characters, escape PDF special chars
        $s = iconv('UTF-8', 'windows-1252//TRANSLIT//IGNORE', $s);
        return str_replace(['\\', '(', ')', "\r"], ['\\\\', '\\(', '\\)', ''], $s);
    }

    // ── Embed JPEG image ─────────────────────────────────────────────────────
    // $xMM, $yMM = top-left corner; $wMM, $hMM = displayed size in mm
    public function addJpeg(string $path, float $xMM, float $yMM, float $wMM, float $hMM): void {
        $this->images[] = [
            'path' => $path,
            'x'    => $xMM,
            'y'    => $yMM,
            'w'    => $wMM,
            'h'    => $hMM,
            'page' => $this->currentPage,
            'name' => 'Im' . (count($this->images) + 1),
        ];
    }

    // ── Save PDF ──────────────────────────────────────────────────────────────
    public function save(string $path): void {
        // Object layout:
        //   1 = Catalog
        //   2 = Pages dictionary
        //   3 = Font /Helvetica
        //   4 = Font /Helvetica-Bold
        //   5 = Font /Helvetica-Oblique
        //   6… = JPEG image XObjects (one per image)
        //   then page content streams + page objects
        $CATALOG_ID  = 1;
        $PAGES_ID    = 2;
        $FONT1_ID    = 3;
        $FONT2_ID    = 4;
        $FONT3_ID    = 5;

        $Wpt = (int)round($this->W * $this->k);
        $Hpt = (int)round($this->H * $this->k);

        $allObjects = [];
        $nextId     = 6;

        // ── Build image XObjects ──────────────────────────────────────────────────────
        $imageXObjIds = []; // name => object id
        foreach ($this->images as &$img) {
            if (!file_exists($img['path'])) continue;
            $jpegData  = file_get_contents($img['path']);
            $jpegSize  = filesize($img['path']);
            $imgInfo   = getimagesize($img['path']);
            $imgW      = $imgInfo[0];
            $imgH      = $imgInfo[1];
            $colorSpace = (isset($imgInfo['channels']) && $imgInfo['channels'] === 1) ? '/DeviceGray' : '/DeviceRGB';

            $imgObjId  = $nextId++;
            $allObjects[$imgObjId] =
                "<<\n/Type /XObject\n/Subtype /Image\n" .
                "/Width $imgW\n/Height $imgH\n" .
                "/ColorSpace $colorSpace\n/BitsPerComponent 8\n" .
                "/Filter /DCTDecode\n/Length $jpegSize\n" .
                ">>\nstream\n" . $jpegData . "\nendstream";

            $img['objId'] = $imgObjId;
            $imageXObjIds[$img['name']] = $imgObjId;
        }
        unset($img);

        // Build XObject resource string
        $xobjStr = '';
        if ($imageXObjIds) {
            $xobjStr = '/XObject <<';
            foreach ($imageXObjIds as $name => $id) {
                $xobjStr .= "/$name $id 0 R ";
            }
            $xobjStr .= '>>';
        }

        // ── Build page content streams with image Do commands ───────────────────
        $pageObjIds = [];
        foreach ($this->pageStreams as $pageIdx => $stream) {
            // Inject image drawing at START of this page's stream
            $imgCmds = '';
            foreach ($this->images as $img) {
                if ($img['page'] !== $pageIdx) continue;
                if (!isset($img['objId'])) continue;
                $xPt = $img['x'] * $this->k;
                $yPt = ($this->H - $img['y'] - $img['h']) * $this->k;
                $wPt = $img['w'] * $this->k;
                $hPt = $img['h'] * $this->k;
                $imgCmds .= sprintf("q %.4f 0 0 %.4f %.4f %.4f cm /%s Do Q\n",
                    $wPt, $hPt, $xPt, $yPt, $img['name']);
            }
            $fullStream = $imgCmds . $stream;
            $streamLen  = strlen($fullStream);

            $contentId = $nextId++;
            $pageId    = $nextId++;

            $allObjects[$contentId] = "<<\n/Length $streamLen\n>>\nstream\n$fullStream\nendstream";
            $allObjects[$pageId]    =
                "<</Type /Page\n" .
                "/Parent $PAGES_ID 0 R\n" .
                "/MediaBox [0 0 $Wpt $Hpt]\n" .
                "/Contents $contentId 0 R\n" .
                "/Resources <</Font <</F1 $FONT1_ID 0 R /F2 $FONT2_ID 0 R /F3 $FONT3_ID 0 R>> $xobjStr>>\n" .
                ">>";
            $pageObjIds[] = $pageId;
        }

        $kidsStr = implode(' 0 R ', $pageObjIds) . ' 0 R';
        $nPages  = count($pageObjIds);

        $allObjects[$CATALOG_ID] = "<</Type /Catalog /Pages $PAGES_ID 0 R>>";
        $allObjects[$PAGES_ID]   = "<</Type /Pages /Kids [$kidsStr] /Count $nPages>>";
        $allObjects[$FONT1_ID]   = "<</Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding>>";
        $allObjects[$FONT2_ID]   = "<</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding>>";
        $allObjects[$FONT3_ID]   = "<</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding>>";


        // Write PDF in object order 1..N
        $out      = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
        $offsets  = [];
        $maxId    = max(array_keys($allObjects));

        for ($id = 1; $id <= $maxId; $id++) {
            if (!isset($allObjects[$id])) continue;
            $offsets[$id] = strlen($out);
            $out .= "$id 0 obj\n" . $allObjects[$id] . "\nendobj\n";
        }

        // Cross-reference table
        $xrefOffset = strlen($out);
        $out .= "xref\n0 " . ($maxId + 1) . "\n";
        $out .= "0000000000 65535 f \n";
        for ($id = 1; $id <= $maxId; $id++) {
            if (isset($offsets[$id])) {
                $out .= str_pad((string)$offsets[$id], 10, '0', STR_PAD_LEFT) . " 00000 n \n";
            } else {
                $out .= "0000000000 65535 f \n";
            }
        }
        $out .= "trailer\n<</Size " . ($maxId + 1) . " /Root $CATALOG_ID 0 R>>\n";
        $out .= "startxref\n$xrefOffset\n%%EOF";

        file_put_contents($path, $out);
    }
}
