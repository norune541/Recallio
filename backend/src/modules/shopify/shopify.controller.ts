import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiNotFoundResponse,
  ApiBadGatewayResponse,
} from '@nestjs/swagger';

import { ClerkAuthGuard } from '../../common/clerk-auth.guard.js';
import {
  ShopifyCallbackQueryDto,
  ShopifyCallbackResponseDto,
} from './dto/shopify.dto.js';
import { ShopifyProductDto } from './dto/shopify-products.dto.js';
import {
  ShopifyShopDto,
  ShopifyShopNotFoundErrorDto,
  ShopifyShopBadGatewayErrorDto,
} from './dto/shopify-shop.dto.js';

import { BeginShopifyAuthUseCase } from './use-cases/auth/begin-shopify-auth.use-case.js';
import { CompleteShopifyAuthUseCase } from './use-cases/auth/complete-shopify-auth.use-case.js';
import { GetProductsUseCase } from './use-cases/api/get-products.js';
import { GetShopUseCase } from './use-cases/api/get-shop.js';
import type { Request, Response } from 'express';

@ApiTags('Shopify')
@Controller('integrations/shopify')
export class ShopifyController {
  constructor(
    private readonly beginShopifyAuth: BeginShopifyAuthUseCase,
    private readonly completeShopifyAuth: CompleteShopifyAuthUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getShopUseCase: GetShopUseCase,
  ) {}

  /**
   * Starts OAuth.
   *
   * Requires an authenticated Recallio user.
   * Example: GET /api/integrations/shopify/connect?shop=example.myshopify.com
   */
  @Get('connect')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Start Shopify OAuth flow' })
  @ApiQuery({
    name: 'shop',
    required: false,
    type: String,
    description: 'Shop domain to connect, e.g. example.myshopify.com',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Shopify authorization page',
  })
  async connect(
    @Req() req: Request,
    @Query('shop') shop: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const authorizationUrl = await this.beginShopifyAuth.execute(
      req.user.id,
      shop,
    );

    res.redirect(authorizationUrl);
  }

  /**
   * Shopify redirects here after the merchant approves the requested scopes.
   * This route must remain public: it is called outside the Recallio Clerk session.
   */
  @Get('callback')
  @ApiOperation({ summary: 'Handle Shopify OAuth callback' })
  @ApiQuery({
    name: 'shop',
    required: false,
    type: String,
    description: 'Shop domain returned by Shopify',
  })
  @ApiQuery({
    name: 'code',
    required: false,
    type: String,
    description: 'Authorization code returned by Shopify',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    type: String,
    description: 'State value used for CSRF verification',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop successfully connected',
    type: ShopifyCallbackResponseDto,
  })
  async callback(
    @Query() query: ShopifyCallbackQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.completeShopifyAuth.execute(
      query as Record<string, unknown>,
    );

    res.status(200).json({
      message: 'Shopify store connected successfully',
      shop: result.shopDomain,
    });
  }

  // TODO: Add cursor pagination to GET /products (`limit`, `after`, return `{ items, pageInfo }`).
  // Verify the default `status` filter (docs mark `active` as default) and `MAX_PAGE_SIZE`.
  @Get('products')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({
    summary: 'Get Shopify products for the current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products for the user shop',
    type: [ShopifyProductDto],
  })
  async getProducts(@Req() req: Request) {
    return await this.getProductsUseCase.execute(req.user.id);
  }

  @Get('shop')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({
    summary: 'Get Shopify shop details for the current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop details fetched from Shopify',
    type: ShopifyShopDto,
  })
  @ApiNotFoundResponse({ type: ShopifyShopNotFoundErrorDto })
  @ApiBadGatewayResponse({ type: ShopifyShopBadGatewayErrorDto })
  async getShop(@Req() req: Request): Promise<ShopifyShopDto> {
    return await this.getShopUseCase.execute(req.user.id);
  }
}
