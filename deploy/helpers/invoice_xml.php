<?php
/**
 * White-label ecommerce XML invoice generator (UBL 2.1 format)
 */

require_once __DIR__ . '/branding.php';

function generateXMLInvoice($order, $items, $cfg = []) {
    $siteName = settingOrDefault($cfg, 'site_name', 'Your Store');
    $email = settingOrDefault($cfg, 'site_email', settingOrDefault($cfg, 'contact_email', 'hello@example.com'));
    $phone = settingOrDefault($cfg, 'site_phone', '');
    $city = settingOrDefault($cfg, 'business_city', '');
    $region = settingOrDefault($cfg, 'business_region', '');
    $country = settingOrDefault($cfg, 'business_country', 'US');
    $currencyCode = settingOrDefault($cfg, 'currency_code', 'USD');

    $dir = __DIR__ . '/../uploads/invoices/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);

    $filename = $dir . $order['order_number'] . '.xml';
    $webPath  = '/uploads/invoices/' . $order['order_number'] . '.xml';

    if (file_exists($filename)) return $webPath;

    $issueDate = date('Y-m-d', strtotime($order['created_at']));
    $dueDate   = date('Y-m-d', strtotime($order['created_at'] . ' +7 days'));

    $addr = $order['shipping_address'];
    if (is_string($addr)) {
        $addrData = json_decode($addr, true) ?? [];
    } else {
        $addrData = is_array($addr) ? $addr : [];
    }

    $xml = new DOMDocument('1.0', 'UTF-8');
    $xml->formatOutput = true;

    $invoice = $xml->createElement('Invoice');
    $invoice->setAttribute('xmlns', 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2');
    $invoice->setAttribute('xmlns:cac', 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2');
    $invoice->setAttribute('xmlns:cbc', 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2');
    $xml->appendChild($invoice);

    // Helper
    $el = function($parent, $ns, $name, $value = null, $attrs = []) use ($xml) {
        $node = $xml->createElement("{$ns}:{$name}");
        if ($value !== null) $node->appendChild($xml->createTextNode((string)$value));
        foreach ($attrs as $k => $v) $node->setAttribute($k, $v);
        $parent->appendChild($node);
        return $node;
    };

    $el($invoice, 'cbc', 'UBLVersionID', '2.1');
    $el($invoice, 'cbc', 'CustomizationID', 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0');
    $el($invoice, 'cbc', 'ID', $order['order_number']);
    $el($invoice, 'cbc', 'IssueDate', $issueDate);
    $el($invoice, 'cbc', 'DueDate', $dueDate);
    $el($invoice, 'cbc', 'InvoiceTypeCode', '380');
    $el($invoice, 'cbc', 'DocumentCurrencyCode', $currencyCode);

    // Supplier
    $supplierParty = $xml->createElement('cac:AccountingSupplierParty');
    $invoice->appendChild($supplierParty);
    $party = $xml->createElement('cac:Party');
    $supplierParty->appendChild($party);
    $partyName = $xml->createElement('cac:PartyName');
    $party->appendChild($partyName);
    $el($partyName, 'cbc', 'Name', $siteName);
    $postalAddr = $xml->createElement('cac:PostalAddress');
    $party->appendChild($postalAddr);
    $el($postalAddr, 'cbc', 'CityName', $city);
    $el($postalAddr, 'cbc', 'CountrySubentity', $region);
    $country = $xml->createElement('cac:Country');
    $postalAddr->appendChild($country);
    $el($country, 'cbc', 'IdentificationCode', $country);
    $contact = $xml->createElement('cac:Contact');
    $party->appendChild($contact);
    $el($contact, 'cbc', 'ElectronicMail', $email);
    $el($contact, 'cbc', 'Telephone', $phone);

    // Customer
    $customerParty = $xml->createElement('cac:AccountingCustomerParty');
    $invoice->appendChild($customerParty);
    $cParty = $xml->createElement('cac:Party');
    $customerParty->appendChild($cParty);
    $cPartyName = $xml->createElement('cac:PartyName');
    $cParty->appendChild($cPartyName);
    $el($cPartyName, 'cbc', 'Name', htmlspecialchars($order['customer_name']));
    $cPostalAddr = $xml->createElement('cac:PostalAddress');
    $cParty->appendChild($cPostalAddr);
    $el($cPostalAddr, 'cbc', 'StreetName', htmlspecialchars($addrData['street'] ?? $addrData['address'] ?? ''));
    $el($cPostalAddr, 'cbc', 'CityName', htmlspecialchars($addrData['city'] ?? ''));
    $el($cPostalAddr, 'cbc', 'PostalZone', htmlspecialchars($addrData['eircode'] ?? $addrData['postcode'] ?? ''));
    $cCountry = $xml->createElement('cac:Country');
    $cPostalAddr->appendChild($cCountry);
    $el($cCountry, 'cbc', 'IdentificationCode', $country);
    $cContact = $xml->createElement('cac:Contact');
    $cParty->appendChild($cContact);
    $el($cContact, 'cbc', 'Telephone', htmlspecialchars($order['customer_phone'] ?? ''));
    if (!empty($order['customer_email'])) {
        $el($cContact, 'cbc', 'ElectronicMail', htmlspecialchars($order['customer_email']));
    }

    // Payment means
    $payMeans = $xml->createElement('cac:PaymentMeans');
    $invoice->appendChild($payMeans);
    $el($payMeans, 'cbc', 'PaymentMeansCode', '30');

    // Tax total
    $taxTotal = $xml->createElement('cac:TaxTotal');
    $invoice->appendChild($taxTotal);
    $el($taxTotal, 'cbc', 'TaxAmount', number_format($order['tax'] ?? 0, 2), ['currencyID' => $currencyCode]);
    $taxSubtotal = $xml->createElement('cac:TaxSubtotal');
    $taxTotal->appendChild($taxSubtotal);
    $el($taxSubtotal, 'cbc', 'TaxableAmount', number_format($order['subtotal'] ?? 0, 2), ['currencyID' => $currencyCode]);
    $el($taxSubtotal, 'cbc', 'TaxAmount', number_format($order['tax'] ?? 0, 2), ['currencyID' => $currencyCode]);
    $taxCat = $xml->createElement('cac:TaxCategory');
    $taxSubtotal->appendChild($taxCat);
    $el($taxCat, 'cbc', 'ID', 'S');
    $el($taxCat, 'cbc', 'Percent', '23');
    $taxScheme = $xml->createElement('cac:TaxScheme');
    $taxCat->appendChild($taxScheme);
    $el($taxScheme, 'cbc', 'ID', 'VAT');

    // Legal monetary total
    $lmt = $xml->createElement('cac:LegalMonetaryTotal');
    $invoice->appendChild($lmt);
    $el($lmt, 'cbc', 'LineExtensionAmount', number_format($order['subtotal'] ?? 0, 2), ['currencyID' => $currencyCode]);
    $el($lmt, 'cbc', 'TaxExclusiveAmount', number_format($order['subtotal'] ?? 0, 2), ['currencyID' => $currencyCode]);
    $el($lmt, 'cbc', 'TaxInclusiveAmount', number_format($order['total'] ?? 0, 2), ['currencyID' => $currencyCode]);
    $el($lmt, 'cbc', 'AllowanceTotalAmount', number_format($order['discount'] ?? 0, 2), ['currencyID' => $currencyCode]);
    $el($lmt, 'cbc', 'ChargeTotalAmount', number_format($order['shipping_charge'] ?? 0, 2), ['currencyID' => $currencyCode]);
    $el($lmt, 'cbc', 'PayableAmount', number_format($order['total'] ?? 0, 2), ['currencyID' => $currencyCode]);

    // Invoice lines
    foreach ($items as $i => $item) {
        $line = $xml->createElement('cac:InvoiceLine');
        $invoice->appendChild($line);
        $el($line, 'cbc', 'ID', $i + 1);
        $el($line, 'cbc', 'InvoicedQuantity', $item['quantity'], ['unitCode' => 'EA']);
        $el($line, 'cbc', 'LineExtensionAmount', number_format($item['total'], 2), ['currencyID' => $currencyCode]);
        $itemNode = $xml->createElement('cac:Item');
        $line->appendChild($itemNode);
        $el($itemNode, 'cbc', 'Name', htmlspecialchars($item['product_name']));
        $price = $xml->createElement('cac:Price');
        $line->appendChild($price);
        $el($price, 'cbc', 'PriceAmount', number_format($item['price'], 2), ['currencyID' => $currencyCode]);
    }

    $xml->save($filename);
    return $webPath;
}
