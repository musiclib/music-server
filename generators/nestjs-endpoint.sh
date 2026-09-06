#!/bin/bash
# eg: ./nestjs-endpoint.sh AdminCreateAccount create-account api/admin Post
SERVICE_CLASS=$1
SERVICE_FILE=$2
API_PATH=$3
METHOD=$4
OVERWRITE=$5
FILE_PATH=./src/${API_PATH}/${SERVICE_FILE}
SERVICE_REFERENCE=$SERVICE_CLASS
SERVICE_REFERENCE=${SERVICE_REFERENCE/Admin/}
SERVICE_REFERENCE=${SERVICE_REFERENCE/Guest/}
SERVICE_REFERENCE=${SERVICE_REFERENCE/User/}

if [ -z $SERVICE_CLASS ]; then
  echo npm run generate:endpoint AdminCreateAccount create-account api/admin Post
  exit 0
fi

if [ -f "$FILE_PATH/${SERVICE_FILE}.controller.ts" ] && [ "$OVERWRITE" != "--overwrite" ]; then
  echo "Error: Controller file already exists at $FILE_PATH/${SERVICE_FILE}.controller.ts"
  echo "Use the --overwrite flag to overwrite existing files."
  exit 1
fi

echo "Generating endpoint for $SERVICE_CLASS at $FILE_PATH"

mkdir -p $FILE_PATH

# The module file
cat <<EOF > $FILE_PATH/${SERVICE_FILE}.module.ts
import { ${SERVICE_CLASS}Controller } from './${SERVICE_FILE}.controller';
import { ${SERVICE_CLASS}Service } from './${SERVICE_FILE}.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [${SERVICE_CLASS}Controller],
  providers: [${SERVICE_CLASS}Service],
})
export class ${SERVICE_CLASS}Module {}
EOF

# The DTO file
cat <<EOF > $FILE_PATH/${SERVICE_FILE}.dto.ts
/* eslint-disable max-classes-per-file */
import {
  BadRequestResponseDto,
  NotFoundResponseDto,
  SuccessResponseDto,
} from 'src/api/response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';

export class ${SERVICE_CLASS}QueryDto {
  // Define your DTO properties here
}

export class ${SERVICE_CLASS}BodyDto {
  // Define your DTO properties here
}

import { SuccessResponseDto } from 'src/api/response.dto';

export class ${SERVICE_CLASS}ResponseDto extends SuccessResponseDto {}

export class ${SERVICE_CLASS}NotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR, ErrorCodes.NOT_FOUND_ERROR],
    enumName: '${SERVICE_CLASS}NotFoundErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}

export class ${SERVICE_CLASS}BadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR],
    enumName: '${SERVICE_CLASS}BadRequestErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}

EOF

# The Service file
cat <<EOF > $FILE_PATH/${SERVICE_FILE}.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ${SERVICE_CLASS}Service {
  constructor() { }
}
EOF

# The Controller file
DECORATORS=""
if [ "$API_PATH" == "api/admin" ]; then
  DECORATORS="@AllowedRoles([UserRoleEnum.ADMIN])
@ApiBearerAuth(JWT_TOKEN)
@ApiHeader({
  name: 'Authorization',
  description: 'Bearer token for authentication',
  required: true,
})"
fi

API_TAGS=""
if [ "$API_PATH" == "api/admin" ]; then
  API_TAGS="ADMIN_APIS"
elif [ "$API_PATH" == "api/user" ]; then
  API_TAGS="USER_APIS"
fi

cat <<EOF > $FILE_PATH/${SERVICE_FILE}.controller.ts
import { ${API_TAGS}, JWT_TOKEN } from 'src/constants/swagger';
import {
  ApiBearerAuth,
  ApiCookieAuth, ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { ${METHOD}, Controller } from '@nestjs/common';
import { ${SERVICE_CLASS}Service } from './${SERVICE_FILE}.service';
import { AllowedRoles } from 'src/api/role.guard';
import { UserRoleEnum } from 'src/constants/enums';

@Controller({
  path: '/${API_PATH}',
})
@ApiTags(${API_TAGS})
export class ${SERVICE_CLASS}Controller {
  constructor(private readonly ${SERVICE_REFERENCE,}Service: ${SERVICE_CLASS}Service) { }

  // eslint-disable-next-line class-methods-use-this
  @${METHOD}('${SERVICE_FILE}')
  ${DECORATORS}
  async ${METHOD,,}() {
    // Implement your endpoint logic here
  }
}
EOF

npx eslint ${FILE_PATH}/*.ts --fix
