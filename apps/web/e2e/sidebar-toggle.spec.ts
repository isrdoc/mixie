import { test, expect } from '@playwright/test';

test.describe('Sidebar Toggle', () => {
  test('should toggle sidebar open and closed', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load and sidebar trigger to be visible
    const sidebarTrigger = page.locator('[data-sidebar="trigger"]');
    await expect(sidebarTrigger).toBeVisible();
    
    // Get initial sidebar state by checking if it's collapsed
    const sidebar = page.locator('[data-slot="sidebar"]');
    await expect(sidebar).toBeVisible();
    
    // Check if sidebar is initially open or closed by looking for collapsed state
    const isInitiallyCollapsed = await sidebar.getAttribute('data-state') === 'collapsed';
    
    if (isInitiallyCollapsed) {
      // Sidebar is closed, click to open it
      await test.step('Open sidebar when initially closed', async () => {
        await sidebarTrigger.click();
        
        // Wait for transition and verify sidebar is expanded
        await expect(sidebar).toHaveAttribute('data-state', 'expanded');
        
        // Verify sidebar content is visible (already have sidebar locator)
        await expect(sidebar).toBeVisible();
      });
      
      // Now close it again
      await test.step('Close sidebar after opening', async () => {
        await sidebarTrigger.click();
        
        // Wait for transition and verify sidebar is collapsed
        await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
      });
    } else {
      // Sidebar is open, click to close it
      await test.step('Close sidebar when initially open', async () => {
        await sidebarTrigger.click();
        
        // Wait for transition and verify sidebar is collapsed
        await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
      });
      
      // Now open it again
      await test.step('Open sidebar after closing', async () => {
        await sidebarTrigger.click();
        
        // Wait for transition and verify sidebar is expanded
        await expect(sidebar).toHaveAttribute('data-state', 'expanded');
        
        // Verify sidebar content is visible (already have sidebar locator)
        await expect(sidebar).toBeVisible();
      });
    }
  });

  test('should have accessible sidebar trigger button', async ({ page }) => {
    await page.goto('/');
    
    const sidebarTrigger = page.locator('[data-sidebar="trigger"]');
    
    // Check accessibility attributes
    await expect(sidebarTrigger).toBeVisible();
    await expect(sidebarTrigger).toBeEnabled();
    
    // Check for screen reader text
    const screenReaderText = sidebarTrigger.locator('.sr-only');
    await expect(screenReaderText).toHaveText('Toggle Sidebar');
  });


  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const sidebarTrigger = page.locator('[data-sidebar="trigger"]');
    const sidebar = page.locator('[data-slot="sidebar"]');
    
    // Sidebar trigger should still be visible and functional on mobile
    await expect(sidebarTrigger).toBeVisible();
    
    // Click to toggle sidebar
    await sidebarTrigger.click();
    
    // Verify sidebar responds to toggle on mobile
    await expect(sidebar).toBeVisible();
  });
});