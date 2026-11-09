import {
  BadRequestException,
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
  Post,
  Param,
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
  ApiParam,
} from '@nestjs/swagger';

import { ClerkAuthGuard } from '../../common/clerk-auth.guard.js';
import {
  ShopifyCallbackQueryDto,
  ShopifyCallbackResponseDto,
} from './dto/shopify.dto.js';
import { ShopifyProductsResponseDto } from './dto/shopify-products.dto.js';
import { ProductResponseDto } from './dto/shopify-product.dto.js';

import {
  ShopifyShopDto,
  ShopifyShopBadGatewayErrorDto,
} from './dto/shopify-shop.dto.js';
import { ShopifyConnectResponseDto } from './dto/shopify-connect.dto.js';

import { ShopNotFoundDto } from './dto/shop-notFound.dto.js';
import { UserNotFoundDto } from '../user/dto/UserNotFound.dto.js';

import { BeginShopifyAuthUseCase } from './use-cases/auth/begin-shopify-auth.use-case.js';
import { CompleteShopifyAuthUseCase } from './use-cases/auth/complete-shopify-auth.use-case.js';
import { GetProductsUseCase } from './use-cases/shop/get-products.js';
import { SyncShopProductsUseCase } from './sync/sync-shop.sync.js';
import { GetProductUseCase } from './use-cases/shop/get-product.js';

import { GetShopUseCase } from './use-cases/shop/get-shop.js';
import { DeleteShop } from './use-cases/shop/delete-shop.use-case.js';

import { getProductsSchema } from '@recallio/shared/schemas';
import type { getProductsType } from '@recallio/shared/schemas';
import type { Request, Response } from 'express';

@ApiTags('Shopify')
@Controller('integrations/shopify')
export class ShopifyController {
  constructor(
    private readonly beginShopifyAuth: BeginShopifyAuthUseCase,
    private readonly completeShopifyAuth: CompleteShopifyAuthUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getShopUseCase: GetShopUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly deleteShop: DeleteShop,
    private readonly syncShopProductsUseCase: SyncShopProductsUseCase,
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

  @Post('sync')
  @UseGuards(ClerkAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start Shopify product synchronization or get current sync status',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['IDLE', 'PENDING', 'CONNECTED', 'FAILED'],
        },
      },
      required: ['status'],
    },
  })
  @ApiExtraModels(ShopNotFoundDto, UserNotFoundDto)
  @ApiNotFoundResponse({
    description: 'Shop or user not found (see `code`)',
    schema: { oneOf: refs(ShopNotFoundDto, UserNotFoundDto) },
  })
  async syncShopProducts(@Req() req: Request) {
    const status = await this.syncShopProductsUseCase.execute(
      req.user.emailAddresses[0].emailAddress,
    );
    return { status };
  }

  @Get('products')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({
    summary:
      'Get Shopify products from database for the current authenticated user',
  })
  @ApiOkResponse({
    description: 'Paginated list of products with variants and AI reviews',
    type: ShopifyProductsResponseDto,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'after',
    required: false,
    type: String,
    description: 'Product ID cursor from the previous page',
  })
  @ApiExtraModels(ShopNotFoundDto, UserNotFoundDto)
  @ApiNotFoundResponse({
    description: 'Shop or user not found (see `code`)',
    schema: { oneOf: refs(ShopNotFoundDto, UserNotFoundDto) },
  })
  async getProducts(
    @Req() req: Request,
    @Query() query: getProductsType,
  ): Promise<ShopifyProductsResponseDto> {
    const parsedQuery = getProductsSchema.safeParse(query);

    if (!parsedQuery.success) {
      throw new BadRequestException('Validation failed');
    }

    return this.getProductsUseCase.execute(
      req.user.emailAddresses[0].emailAddress,
      parsedQuery.data.limit,
      parsedQuery.data.after,
    );
  }

  @Get('products/:productId')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Analyze Shopify product with AI' })
  @ApiOkResponse({
    description: 'Shopify product details with AI analysis',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'productId is required',
  })
  @ApiExtraModels(ShopNotFoundDto, UserNotFoundDto)
  @ApiNotFoundResponse({
    description: 'Shop or user not found (see `code`)',
    schema: { oneOf: refs(ShopNotFoundDto, UserNotFoundDto) },
  })
  @ApiParam({
    name: 'productId',
    required: true,
    type: String,
    description: 'Shopify product ID (GID)',
    example: 'gid://shopify/Product/123456789',
  })
  async getProduct(@Req() req: Request, @Param('productId') productId: string) {
    return await this.getProductUseCase.execute(
      req.user.emailAddresses[0].emailAddress,
      productId,
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
  @ApiForbiddenResponse({
    description: 'Only the shop owner can delete the shop.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMembership(@Req() req: Request) {
    await this.deleteShop.execute(req.user.emailAddresses[0].emailAddress);
  }
}
