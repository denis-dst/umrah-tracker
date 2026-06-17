<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Extrak Vendor</h1>";

$zip = new ZipArchive;
$res = $zip->open('../vendor.zip');
if ($res === TRUE) {
  $zip->extractTo('../vendor/');
  $zip->close();
  echo "<h2>OK: Vendor berhasil diekstrak!</h2>";
  // Delete the vendor.zip to save space
  unlink('../vendor.zip');
  
  // Also run the deploy commands again to ensure DB and storage link are done
  try {
      echo "<h3>Menjalankan Migrasi Database...</h3>";
      $output = shell_exec('cd .. && php artisan migrate:fresh --seed --force 2>&1');
      echo "<pre>$output</pre>";

      echo "<h3>Membuat Storage Link...</h3>";
      $output2 = shell_exec('cd .. && php artisan storage:link 2>&1');
      echo "<pre>$output2</pre>";
      
      echo "<h3>Membersihkan Cache Server...</h3>";
      shell_exec('cd .. && php artisan optimize:clear 2>&1');
      echo "<pre>Cache berhasil dibersihkan!</pre>";
  } catch(Exception $e) {}
} else {
  echo "<h2>Gagal mengekstrak vendor.zip! Error code: $res</h2>";
}
?>
