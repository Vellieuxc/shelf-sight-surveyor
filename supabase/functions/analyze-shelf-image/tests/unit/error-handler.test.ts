
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { handleError, ValidationError, AuthError, ExternalServiceError } from "../../error-handler.ts";

Deno.test("handleError should return correct status for ValidationError", () => {
  const error = new ValidationError("Invalid input");
  const response = handleError(error, "test-request-id");
  
  assertEquals(response.status, 400);
  
  // Parse response body
  response.json().then(body => {
    assertEquals(body.success, false);
    assertEquals(body.error, "Invalid input");
    assertEquals(body.errorType, "ValidationError");
  });
});

Deno.test("handleError should return correct status for AuthError", () => {
  const error = new AuthError("Unauthorized");
  const response = handleError(error, "test-request-id");
  
  assertEquals(response.status, 401);
  
  response.json().then(body => {
    assertEquals(body.success, false);
    assertEquals(body.error, "Unauthorized");
    assertEquals(body.errorType, "AuthError");
  });
});

Deno.test("handleError should return correct status for ExternalServiceError", () => {
  const error = new ExternalServiceError("API error");
  const response = handleError(error, "test-request-id");
  
  assertEquals(response.status, 502);
  
  response.json().then(body => {
    assertEquals(body.success, false);
    assertEquals(body.error, "API error");
    assertEquals(body.errorType, "ExternalServiceError");
  });
});

Deno.test("handleError should return 500 for unknown errors", () => {
  const error = new Error("Unknown error");
  const response = handleError(error, "test-request-id");
  
  assertEquals(response.status, 500);
  
  response.json().then(body => {
    assertEquals(body.success, false);
    assertEquals(body.error, "Unknown error");
    assertEquals(body.errorType, "Error");
  });
});
