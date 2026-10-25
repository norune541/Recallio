import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiNotFoundResponse,
  ApiBadGatewayResponse,
  ApiExtraModels,
  refs,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

import { ClerkAuthGuard } from '../../common/clerk-auth.guard.js';
import {
  ShopifyCallbackQueryDto,
  ShopifyCallbackResponseDto,
} from './dto/shopify.dto.js';
import { ShopifyProductDto } from './dto/shopify-products.dto.js';
import {
  ShopifyShopDto,
  ShopifyShopBadGatewayErrorDto,
} from './dto/shopify-shop.dto.js';
import { ShopifyConnectResponseDto } from './dto/shopify-connect.dto.js';

import { ShopNotFoundDto } from './dto/shop-notFound.dto.js';
import { UserNotFoundDto } from '../user/dto/UserNotFound.dto.js';

import { BeginShopifyAuthUseCase } from './use-cases/auth/begin-shopify-auth.use-case.js';
import { CompleteShopifyAuthUseCase } from './use-cases/auth/complete-shopify-auth.use-case.js';
import { GetProductsUseCase } from './use-cases/api/get-products.js';
import { GetShopUseCase } from './use-cases/api/get-shop.js';
import { DeleteShop } from './use-cases/shop/delete-shop.use-case.js';
import type { Request, Response } from 'express';

@ApiTags('Shopify')
@Controller('integrations/shopify')
export class ShopifyController {
  constructor(
    private readonly beginShopifyAuth: BeginShopifyAuthUseCase,
    private readonly completeShopifyAuth: CompleteShopifyAuthUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getShopUseCase: GetShopUseCase,
    private readonly deleteShop: DeleteShop,
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
    required: true,
    type: String,
    description: 'Shop domain to connect, e.g. example.myshopify.com',
  })
  @ApiOkResponse({
    description: 'Redirect to Shopify authorization page',
    type: ShopifyConnectResponseDto,
  })
  @ApiConflictResponse({
    description: 'Shop already exists',
  })
  async connect(
    @Req() req: Request,
    @Query('shop') shop: string | undefined,
  ): Promise<ShopifyConnectResponseDto> {
    const url = await this.beginShopifyAuth.execute(
      req.user.emailAddresses[0].emailAddress,
      shop,
    );
    return { url };
  }

  /**
   * Shopify redirects here after the merchant approves the requested scopes.
   * This route must remain public: it is called outside the Recallio Clerk session.
   */
  @Get('callback')
  @ApiOperation({ summary: 'Handle Shopify OAuth callback' })
  @ApiQuery({
    name: 'shop',
    required: true,
    type: String,
    description: 'Shop domain returned by Shopify',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    type: String,
    description: 'Authorization code returned by Shopify',
  })
  @ApiQuery({
    name: 'state',
    required: true,
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
    await this.completeShopifyAuth.execute(query as Record<string, unknown>);

    return res.redirect(`http://localhost:5173/`);
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
  @ApiExtraModels(ShopNotFoundDto, UserNotFoundDto)
  @ApiNotFoundResponse({
    description: 'Shop or user not found (see `code`)',
    schema: { oneOf: refs(ShopNotFoundDto, UserNotFoundDto) },
  })
  @ApiBadGatewayResponse({ type: ShopifyShopBadGatewayErrorDto })
  async getProducts(@Req() req: Request): Promise<ShopifyProductDto[]> {
    return await this.getProductsUseCase.execute(
      req.user.emailAddresses[0].emailAddress,
    );
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
  @ApiBadGatewayResponse({ type: ShopifyShopBadGatewayErrorDto })
  @ApiForbiddenResponse({ type: ForbiddenException })
  @ApiExtraModels(ShopNotFoundDto, UserNotFoundDto)
  @ApiNotFoundResponse({
    description: 'Shop or user not found (see `code`)',
    schema: { oneOf: refs(ShopNotFoundDto, UserNotFoundDto) },
  })
  async getShop(@Req() req: Request): Promise<ShopifyShopDto> {
    return await this.getShopUseCase.execute(
      req.user.emailAddresses[0].emailAddress,
    );
  }

  @Delete()
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({
    summary: 'Disconnect and delete the Shopify shop',
  })
  @ApiResponse({
    status: 204,
    description: 'Shop successfully deleted.',
  })
  @ApiExtraModels(ShopNotFoundDto, UserNotFoundDto)
  @ApiNotFoundResponse({
    description: 'Shop or user not found (see `code`)',
    schema: { oneOf: refs(ShopNotFoundDto, UserNotFoundDto) },
  })
  @ApiBadRequestResponse({
    description:
      'The shop owner cannot leave while other members remain. Ownership must be transferred first.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMembership(@Req() req: Request) {
    await this.deleteShop.execute(req.user.emailAddresses[0].emailAddress);
  }
}
