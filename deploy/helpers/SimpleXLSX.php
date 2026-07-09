<?php
/**
 * SimpleXLSX — lightweight XLSX reader (no Composer needed)
 * Uses PHP's native ZipArchive + SimpleXML
 */
class SimpleXLSX {
    private $sharedStrings = [];
    private $sheets = [];

    public static function parse($file) {
        $xlsx = new self();
        if (!$xlsx->load($file)) return false;
        return $xlsx;
    }

    private function load($file) {
        if (!class_exists('ZipArchive')) return false;
        $zip = new ZipArchive();
        if ($zip->open($file) !== true) return false;

        // Shared strings
        $ss = $zip->getFromName('xl/sharedStrings.xml');
        if ($ss) {
            $xml = simplexml_load_string($ss, 'SimpleXMLElement', LIBXML_NOCDATA);
            if ($xml) {
                foreach ($xml->si as $si) {
                    if (isset($si->t)) {
                        $this->sharedStrings[] = (string)$si->t;
                    } else {
                        $val = '';
                        foreach ($si->r as $r) $val .= (string)($r->t ?? '');
                        $this->sharedStrings[] = $val;
                    }
                }
            }
        }

        // Sheets
        $i = 1;
        while (($sheetXml = $zip->getFromName("xl/worksheets/sheet{$i}.xml")) !== false) {
            $rows = [];
            $xml = simplexml_load_string($sheetXml, 'SimpleXMLElement', LIBXML_NOCDATA);
            if ($xml && isset($xml->sheetData->row)) {
                foreach ($xml->sheetData->row as $row) {
                    $rowData = [];
                    $maxCol = 0;
                    foreach ($row->c as $cell) {
                        $ref  = (string)$cell['r'];
                        $col  = $this->colIndex($ref);
                        $type = (string)$cell['t'];
                        $v    = isset($cell->v) ? (string)$cell->v : '';
                        if ($type === 's') $v = $this->sharedStrings[(int)$v] ?? '';
                        elseif ($type === 'inlineStr') $v = (string)($cell->is->t ?? '');
                        $rowData[$col] = $v;
                        if ($col > $maxCol) $maxCol = $col;
                    }
                    // Fill gaps with empty string
                    $filled = [];
                    for ($c = 0; $c <= $maxCol; $c++) $filled[] = $rowData[$c] ?? '';
                    $rows[] = $filled;
                }
            }
            $this->sheets[] = $rows;
            $i++;
        }
        $zip->close();
        return count($this->sheets) > 0;
    }

    private function colIndex($ref) {
        preg_match('/([A-Z]+)/', $ref, $m);
        $col = 0;
        foreach (str_split($m[1]) as $ch) $col = $col * 26 + (ord($ch) - 64);
        return $col - 1;
    }

    public function rows($sheetIndex = 0) {
        return $this->sheets[$sheetIndex] ?? [];
    }

    public function sheetsCount() { return count($this->sheets); }
}
