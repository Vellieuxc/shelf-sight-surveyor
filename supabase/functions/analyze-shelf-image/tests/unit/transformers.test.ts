
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { transformAnalysisData } from "../../transformers.ts";

Deno.test("transformAnalysisData should transform valid data", () => {
  const mockAnalysisData = [
    {
      SKUFullName: "Test Product",
      SKUBrand: "Test Brand",
      NumberFacings: 3,
      PriceSKU: "$9.99",
      ShelfSection: "middle",
      BoundingBox: { confidence: 0.92 }
    }
  ];
  
  const result = transformAnalysisData(mockAnalysisData);
  assertEquals(result.length, 1);
  assertEquals(result[0].sku_name, "Test Product");
  assertEquals(result[0].brand, "Test Brand");
  assertEquals(result[0].sku_count, 3);
  assertEquals(result[0].sku_price, 9.99);
  assertEquals(result[0].sku_position, "middle");
  assertEquals(result[0].sku_confidence, "high");
});

Deno.test("transformAnalysisData should handle empty arrays", () => {
  const result = transformAnalysisData([]);
  assertEquals(result.length, 0);
});

Deno.test("transformAnalysisData should filter invalid items", () => {
  const mockAnalysisData = [
    null,
    {},
    "string",
    {
      SKUFullName: "Valid Product",
      SKUBrand: "Valid Brand",
      NumberFacings: 2
    }
  ];
  
  const result = transformAnalysisData(mockAnalysisData as any);
  assertEquals(result.length, 1);
  assertEquals(result[0].sku_name, "Valid Product");
});

Deno.test("transformAnalysisData should handle price formats", () => {
  const mockData = [
    { SKUFullName: "Product 1", PriceSKU: "$10.99" },
    { SKUFullName: "Product 2", PriceSKU: "5.99" },
    { SKUFullName: "Product 3", PriceSKU: "€7,99" },
    { SKUFullName: "Product 4", PriceSKU: "invalid" }
  ];
  
  const result = transformAnalysisData(mockData);
  assertEquals(result[0].sku_price, 10.99);
  assertEquals(result[1].sku_price, 5.99);
  assertEquals(result[2].sku_price, 7.99);
  assertEquals(result[3].sku_price, 0);
});
